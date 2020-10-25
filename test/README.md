# UI/UX on your local laptop

You can create a docker container with the UI/UX image which you can use for testing/development

In this directory, run ./create.sh and that will in the end give you a URL/http link which you can paste
into your browser and you will see the nextensio UI. Before you do that, you have to install the below on
your laptop

* install docker - plenty of docs on internet to do that

* docker login registry.gitlab.com - the script uses images for each of the components - controller, UI/UX
  all stored in gitlab. Today they are manually built and kept there, but its easy to automate
  that with gitlab CI/CD. So you need to login to the image repo to be able to allow the scripts to download the
  images, this is a one time activity

* install kind (https://kind.sigs.k8s.io/docs/user/quick-start/) - the kind command needs to be in $PATH

## Deleting the UI/UX test container

Just say 'kind delete cluster --name ui'

## Using your own UI/UX image

Lets say you make some UI/UX changes and want to test it out, this is how you can do it.

1. Make your changes
2. In the nextensio/ux root of the source code where you find the file name Dockerfile, say "make deploy"
3. The above step will create an image named registry.gitlab.com/nextensio/ux/ux-deploy and tag '0.1'
4. Note the sha/hash string in the "IMAGE ID" column of the image you just build (with tag 0.1)
5. Say "docker tag <paste IMAGE ID> registry.gitlab.com/nextensio/ux/ux-deploy:test"
6. After deleting the old container, run ./create.sh again, this time it will pick up your image



