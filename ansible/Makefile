deploy:
	ansible-playbook release.yml -i inventory.yml --extra-vars="version=v${V}" -vv

setup:
	ansible-playbook setup.yml -i inventory.yml --extra-vars="version=v${V}" -vv
