# UI/UX on your local laptop

You can create a docker container with the UI/UX image which you can use for testing/development

In this directory, build the UI/UX image (see the section "Building UI/UX image") and run ./create.sh, 
and that will in the end give you a URL/http link which you can paste into your browser and you will 
see the nextensio UI. Before you do that, you have to install the below on your laptop

* install docker - plenty of docs on internet to do that

* docker login registry.gitlab.com - the script uses images for each of the components - controller, UI/UX
  all stored in gitlab. Today they are manually built and kept there, but its easy to automate
  that with gitlab CI/CD. So you need to login to the image repo to be able to allow the scripts to download the
  images, this is a one time activity

* install kind (https://kind.sigs.k8s.io/docs/user/quick-start/) - the kind command needs to be in $PATH

## Deleting the UI/UX test container

Just say 'kind delete cluster --name ui'

## Building UI/UX image

Lets say you make some UI/UX changes and want to test it out, this is how you can do it.

1. Make your code changes
2. In the nextensio/ux root of the source code where you find the file name Dockerfile, say "make deploy"
3. The above step will create an image named registry.gitlab.com/nextensio/ux/ux-deploy and tag '0.1', 
   you can see your image when you type "docker images"
4. Note the sha/hash string in the "IMAGE ID" column (output of 'docker images') of the image you just built (with tag 0.1)
5. Say "docker tag <paste IMAGE ID> registry.gitlab.com/nextensio/ux/ux:latest"
6. Now if you run create.sh, it will pick up the new image you built and create a testbed
7. Login credentials are user: apogphone@gmail.com
                         pass: Nextensio238 


## What is created by create.sh

What is created by the script is a kubernetes cluster running in a test kubernetes environment 
called 'kind' (Kubernetes IN Docker). The kubernetes cluster has one 'pod' running nodejs serving
the react UI code, one 'pod' running the 'controller' which is the backend code that handles REST
APIs etc.. and three pods running mongodb which is our database.

There will be one pod for the loadbalancer haproxy which says crashed/terminated, that is fine, just
ignore it.

### Accessing a pod / logging into the pod

Lets say you want to get into the ui pod, this is what you do

1. kubectl config use-context kind-ui
2. kubectl get pods --all-namespaces
3. Find the pod that has "nextensio-ux" in its name and do the below to get into it, your podname will
   be different from what ive typed below
   'kubectl exec -it nextensio-ux-545dc76c4c-x75rh -- /bin/bash'
4. Now if you say ps -aef you can see process id 1 as 'node ..', note that the process id 1 is nothing
   but what we provide as CMD in the Dockerfile in nextensio/ux 

Points to note: If process id 1 terminates, kubernetes will restart the entire pod, so any changes you
made inside the pod will be lost if your pid 1 terminates. If you want to make quick code changes inside
the pod and test, you can always change the javascript code that you will see inside the pod, nodejs is
smart enough to detect a file being changed and ensure that it will serve the new javascript code to anyone
who requests it after this - so if you refresh your browser you will get the new code from nodejs. Again,
if you kill nodejs process, your entire pod will terminate and all your code changes will go away, so
be careful if you are making lots of code changes inside the pod itself, save it somewhere!


