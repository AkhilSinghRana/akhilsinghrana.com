#####################################################
# python-make                                       #
# ===========                                       #
#                                                   #
# This is a simple Makefile wrapper to map 'make'   #
# So you can, for example, use commands like this   #
# from the command line:                            #
#                                                   #
#    make lint		                                #
#    make format-code                               #
#    make test                                      #
#    make clean    									#
#                                                   #
#####################################################

PYTHON = python

lint:
	@echo "Running black with --check --diff..."
	@$(PYTHON) -m black --check --diff --color .
	@echo "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"
	@echo "Running Pylint"
	@pylint akhilsinghrana/

format-code:
	@echo "Running black..."
	@$(PYTHON) -m black .

test:
	@echo "Running tests..."
	@$(PYTHON) -m pytest

clean:
	@echo "Cleaning..."
	@echo $(pscp)
	@rm -r ./akhilsinghrana/__pycache__/
