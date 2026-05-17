.PHONY: feat
feat:
	git add -A
	git commit -m "feat: Introduce new features"
	git push origin main

.PHONY: init
init:
	rm -rf ./.git
	git init
	git add -A
	git commit -m "Initial commit"
	git remote add origin git@github.com:hangtiancheng/ai-en.git
	git push origin main --set-upstream --force

.PHONY: ecdict
ecdict:
	git clone git@github.com:skywind3000/ECDICT.git
	cp ./ECDICT/ecdict.csv ./ecdict.csv
	rm -rf ./ECDICT
	
