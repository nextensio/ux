VERSION=latest
NAME=ux
USER=registry.gitlab.com/nextensio/ux

.PHONY: all
all: build

.PHONY: build
build:
	rm -r -f files/version
	echo $(VERSION) > files/version
	docker build -f Dockerfile.build -t $(USER)/$(NAME):$(VERSION) .
	docker create $(USER)/$(NAME):$(VERSION)

.PHONY: clean
clean:
	-rm -r -f files/version

