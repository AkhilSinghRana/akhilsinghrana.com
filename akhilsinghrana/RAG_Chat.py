import os
from dotenv import load_dotenv

# load raw files
from langchain_community.document_loaders import html_bs
from langchain.text_splitter import HTMLHeaderTextSplitter
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_chroma import Chroma
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langchain.schema import Document
from langchain_community.tools.tavily_search import TavilySearchResults

from typing_extensions import TypedDict, List

from langgraph.graph import END, StateGraph
import uuid

load_dotenv()  # This is for testing the setup locally make sure to includer VAraibles in your github repo


class RAGChat:
    def __init__(self, recreateVectorDB=False, **kwargs) -> None:
        persistent_directory = "./db/chroma_db"
        # Create embedding for my documents, I am using hugging face embeddings
        # Then we will create a vector database using Chroma
        model_name = "BAAI/bge-large-en-v1.5"
        model_kwargs = {"device": "cpu"}
        encode_kwargs = {"normalize_embeddings": True}
        self.embeddings = HuggingFaceBgeEmbeddings(
            model_name=model_name,
            model_kwargs=model_kwargs,
            encode_kwargs=encode_kwargs,
        )
        if recreateVectorDB:
            folder_path = kwargs.get("folder")
            html_files = []
            for file in os.listdir(folder_path):
                html_files.append(os.path.join(folder_path, file))

            # Now we will read contents of all the file using html data loader
            raw_documents = [html_bs.BSHTMLLoader(file).load() for file in html_files]

            # Create Chunks for Vector db
            headers_to_split_on = [
                ("h1", "Header 1"),
                ("h2", "Header 2"),
                ("h3", "Header 3"),
                ("section", "Section"),
            ]

            text_splitter = HTMLHeaderTextSplitter(
                headers_to_split_on=headers_to_split_on
            )
            doc_splits = []
            for doc in raw_documents:
                doc = text_splitter.split_text(doc[0].page_content)

                doc_splits.extend(doc)

            vectorstore = Chroma.from_documents(
                doc_splits,
                embedding=self.embeddings,
                persist_directory=persistent_directory,
            )

            self.retriever = vectorstore.as_retriever(
                search_type="similarity_score_threshold",
                search_kwargs={"k": 3, "score_threshold": 0.1},
            )
        else:
            # vector db already exist
            # Load the existing vector store with the embedding function
            vectorstore = Chroma(
                persist_directory=persistent_directory,
                embedding_function=self.embeddings,
            )
            self.retriever = vectorstore.as_retriever(
                search_type="similarity_score_threshold",
                search_kwargs={"k": 3, "score_threshold": 0.1},
            )

        # Now we can create our LLM
        self.llm = ChatGroq(
            model="llama-3.1-70b-versatile",
            temperature=0,
            max_tokens=None,
            timeout=None,
            max_retries=2,
            # other params...
        )

        # this is our main generative RAG chain
        prompt = PromptTemplate(
            template="""You are an assistant for question-answering tasks. 
            
            Use the following documents to answer the question. 
            
            If you don't know the answer, just say that you don't know. 
            
            Use four sentences maximum and keep the answer concise:
            Question: {question} 
            Documents: {documents} 
            Answer: 
            """,
            input_variables=["question", "documents"],
        )

        self.rag_chain = prompt | self.llm | StrOutputParser()

        prompt = PromptTemplate(
            template="""You are a grader assessing relevance of a retrieved document to a user question. \n 
            Here is the retrieved document: \n\n {document} \n\n
            Here is the user question: {question} \n
            If the document contains keywords or any relevant information to the user question, grade it as relevant. \n
            It does not need to be a stringent test. The goal is to filter out erroneous retrievals. \n
            Give a binary score 'yes' or 'no' score to indicate whether the document is relevant to the question. \n
            Provide the binary score as a JSON with a single key 'score' and no premable or explanation.""",
            input_variables=["question", "document"],
        )

        self.retrieval_grader = prompt | self.llm | JsonOutputParser()

        # we use Tavily for external web search
        self.web_search_tool = TavilySearchResults()

        # now we can produce our execution graph
        self.prepare_execution_graph()

    def prepare_execution_graph(self):
        class GraphState(TypedDict):
            """
            Represents the state of our graph.

            Attributes:
                question: question
                generation: LLM generation
                search: whether to add search
                documents: list of documents
            """

            question: str
            generation: str
            search: str
            documents: List[str]
            steps: List[str]

        def retrieve(state):
            """
            Retrieve documents

            Args:
                state (dict): The current graph state

            Returns:
                state (dict): New key added to state, documents, that contains retrieved documents
            """
            question = state["question"]
            documents = self.retriever.invoke(question)
            steps = state["steps"]
            steps.append("retrieve_documents")
            return {"documents": documents, "question": question, "steps": steps}

        def generate(state):
            """
            Generate answer

            Args:
                state (dict): The current graph state

            Returns:
                state (dict): New key added to state, generation, that contains LLM generation
            """

            question = state["question"]
            documents = state["documents"]
            generation = self.rag_chain.invoke(
                {"documents": documents, "question": question}
            )
            steps = state["steps"]
            steps.append("generate_answer")
            return {
                "documents": documents,
                "question": question,
                "generation": generation,
                "steps": steps,
            }

        def grade_documents(state):
            """
            Determines whether the retrieved documents are relevant to the question.

            Args:
                state (dict): The current graph state

            Returns:
                state (dict): Updates documents key with only filtered relevant documents
            """

            question = state["question"]
            documents = state["documents"]
            steps = state["steps"]
            steps.append("grade_document_retrieval")
            filtered_docs = []
            search = "No"
            for d in documents:
                score = self.retrieval_grader.invoke(
                    {"question": question, "document": d.page_content}
                )
                grade = score["score"]
                if grade == "yes":
                    filtered_docs.append(d)
                else:
                    search = "Yes"
                    continue
            return {
                "documents": filtered_docs,
                "question": question,
                "search": search,
                "steps": steps,
            }

        def web_search(state):
            """
            Web search based on the re-phrased question.

            Args:
                state (dict): The current graph state

            Returns:
                state (dict): Updates documents key with appended web results
            """

            question = state["question"]
            documents = state.get("documents", [])
            steps = state["steps"]
            steps.append("web_search")
            web_results = self.web_search_tool.invoke({"query": question})
            documents.extend(
                [
                    Document(page_content=d["content"], metadata={"url": d["url"]})
                    for d in web_results
                ]
            )
            return {"documents": documents, "question": question, "steps": steps}

        def decide_to_generate(state):
            """
            Determines whether to generate an answer, or re-generate a question.

            Args:
                state (dict): The current graph state

            Returns:
                str: Binary decision for next node to call
            """
            search = state["search"]
            if search == "Yes":
                return "search"
            else:
                return "generate"

        # Graph
        workflow = StateGraph(GraphState)

        # Define the nodes
        workflow.add_node("retrieve", retrieve)  # retrieve
        workflow.add_node("grade_documents", grade_documents)  # grade documents
        workflow.add_node("generate", generate)  # generatae
        workflow.add_node("web_search", web_search)  # web search

        # Build graph
        workflow.set_entry_point("retrieve")
        workflow.add_edge("retrieve", "grade_documents")
        workflow.add_conditional_edges(
            "grade_documents",
            decide_to_generate,
            {
                "search": "web_search",
                "generate": "generate",
            },
        )
        workflow.add_edge("web_search", "generate")
        workflow.add_edge("generate", END)

        # display(Image(custom_graph.get_graph(xray=True).draw_mermaid_png())) # imageGenerate
        self.custom_graph = workflow.compile()

    def get_answer(self, question: dict):
        config = {"configurable": {"thread_id": str(uuid.uuid4())}}

        state_dict = self.custom_graph.invoke(
            {"question": question["input"], "steps": []}, config
        )

        return {"response": state_dict["generation"], "steps": state_dict["steps"]}
