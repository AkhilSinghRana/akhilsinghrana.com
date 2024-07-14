#####################################################
# python-make                                       #
# ===========                                       #
#                                                   #
# This is a simple Makefile wrapper to map 'make'   #
# ulility commands to python 'setup.py' commands.   #
# So you can, for example, use commands like this   #
# from the command line:                            #
#                                                   #
#    make                                           #
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
	@rm -rf build dist *.egg-info