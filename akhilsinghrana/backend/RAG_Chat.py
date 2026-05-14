import os
import logging
from dotenv import load_dotenv

# load raw files
from functools import lru_cache
from langchain_community.document_loaders import html_bs
from langchain_huggingface import HuggingFaceEndpointEmbeddings

from langchain_text_splitters import HTMLHeaderTextSplitter

# from langchain_core.pydantic_v1 import BaseModel, Field
# from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEndpoint
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langchain_core.documents import Document
from langchain_tavily import TavilySearch

from typing_extensions import TypedDict, List
from tqdm import tqdm
from langgraph.graph import END, StateGraph
import uuid

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
logger = logging.getLogger(__name__)


class RAGChat:
    def __init__(self, recreateVectorDB=False, **kwargs) -> None:
        self.persistent_directory = os.path.join(os.path.dirname(__file__), "db", "faiss_db")
        self.embeddings = self.get_embeddings()
        self.retriever = self.get_retriever(recreateVectorDB, **kwargs)
        self.llm = self.get_llm()  # defaults to groq

        self.create_execution_pipeline()

    def create_execution_pipeline(self):
        self.rag_chain = self.create_rag_chain()
        self.retrieval_grader = self.create_retrieval_grader()
        self._web_search_tool = None  # lazy-init: requires TAVILY_API_KEY at call time
        self.prepare_execution_graph()

    @property
    def web_search_tool(self):
        if self._web_search_tool is None:
            self._web_search_tool = TavilySearch(max_results=3)
        return self._web_search_tool

    @lru_cache(maxsize=10)
    def get_embeddings(self):
        return HuggingFaceEndpointEmbeddings(
            model="BAAI/bge-large-en-v1.5",
            huggingfacehub_api_token=os.environ.get("HF_API_KEY"),
        )

    @lru_cache(maxsize=10)
    def get_llm(self):
        return ChatGroq(
            model="llama-3.1-8b-instant",
            temperature=0,
            max_tokens=None,
            timeout=None,
            max_retries=2,
        )

    @lru_cache(maxsize=10)
    def get_hf_llm(self):
        repo_id = "mistralai/Mistral-7B-Instruct-v0.2"

        llm = HuggingFaceEndpoint(
            repo_id=repo_id,
            max_length=128,
            temperature=0.5,
            huggingfacehub_api_token=os.environ.get("HF_API_KEY"),
        )

        return llm

    def create_rag_chain(self):
        prompt = PromptTemplate(
            template="""You are an assistant for question-answering tasks. 
            Use the following documents to answer the question. 
            If you don't know the answer, just say that you don't know. 
            Use four to five sentences maximum and keep the answer concise:
            Question: {question} 
            Documents: {documents} 
            Answer: 
            """,
            input_variables=["question", "documents"],
        )
        return prompt | self.llm | StrOutputParser()

    def create_retrieval_grader(self):
        prompt = PromptTemplate(
            template="""You are a grader assessing relevance of a retrieved document to a user question. 
            Here is the retrieved document: \n\n {document} \n\n
            Here is the user question: {question} \n
            If the document contains keywords or any relevant information to the user question, grade it as relevant. 
            It does not need to be a stringent test. The goal is to filter out erroneous retrievals. Please be little moderate while scoring.
            Give a binary score 'yes' or 'no' score to indicate whether the document is relevant to the question. 
            Provide the binary score as a JSON with a single key 'score' and no preamble or explanation.""",
            input_variables=["question", "document"],
        )
        return prompt | self.llm | JsonOutputParser()

    def get_retriever(self, recreateVectorDB, **kwargs):
        if recreateVectorDB or not os.path.exists(self.persistent_directory):
            vectorstore = self.create_vector_store(**kwargs)
        else:
            vectorstore = FAISS.load_local(
                self.persistent_directory,
                self.embeddings,
                allow_dangerous_deserialization=True,
            )
        return vectorstore.as_retriever(
            search_type="similarity_score_threshold",
            search_kwargs={"k": 3, "score_threshold": 0.1},
        )

    def create_vector_store(self, **kwargs):
        folder_path = kwargs.get("folder")
        batch_size = kwargs.get("batch_size", 100)

        all_splits = []

        # ── Load HTML blog files ──────────────────────────────────────────────
        html_files = [
            os.path.join(folder_path, f)
            for f in os.listdir(folder_path)
            if f.endswith(".html")
        ]
        raw_documents = []
        for file in tqdm(html_files, desc="Loading HTML files"):
            raw_documents.extend(html_bs.BSHTMLLoader(file).load())

        headers_to_split_on = [("h1", "Header 1"), ("h2", "Header 2"), ("h3", "Header 3")]
        text_splitter = HTMLHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
        for i in tqdm(range(0, len(raw_documents), batch_size), desc="Processing HTML"):
            for doc in raw_documents[i : i + batch_size]:
                all_splits.extend(text_splitter.split_text(doc.page_content))

        # ── Load site-content.json (about, publications, skills, education) ───
        content_json = os.path.join(os.path.dirname(__file__), "content", "site-content.json")
        if os.path.exists(content_json):
            import json
            with open(content_json, "r", encoding="utf-8") as f:
                data = json.load(f)
            # Index the flat text_summary as one document
            if data.get("text_summary"):
                all_splits.append(Document(
                    page_content=data["text_summary"],
                    metadata={"source": "site-content"},
                ))
            # Index each publication individually for precise retrieval
            for pub in data.get("publications", []):
                all_splits.append(Document(
                    page_content=f"Publication: {pub['title']} — published in {pub['venue']}. URL: {pub.get('url', '')}",
                    metadata={"source": "publications"},
                ))
            logger.info(f"Loaded site-content.json ({len(data.get('publications', []))} publications)")
        else:
            logger.warning(f"site-content.json not found at {content_json} — skipping structured content indexing")

        # ── Build vector store ────────────────────────────────────────────────
        vectorstore = FAISS.from_documents(
            documents=all_splits,
            embedding=self.embeddings,
        )
        os.makedirs(self.persistent_directory, exist_ok=True)
        vectorstore.save_local(self.persistent_directory)
        return vectorstore

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
            # TavilySearch returns {"results": [{"content": ..., "url": ...}, ...]}
            if isinstance(web_results, dict):
                hits = web_results.get("results", [])
            elif isinstance(web_results, list):
                hits = web_results
            else:
                hits = []
            documents.extend(
                [Document(page_content=d["content"], metadata={"url": d.get("url", "")}) for d in hits]
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
