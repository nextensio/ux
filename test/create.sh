#!/usr/bin/env bash

tmpdir=/tmp/nextensio-ux
kubectl=$tmpdir/kubectl

function create_ui {
    kind create cluster --name ui

    # Get the controller and UI/UX images
    docker pull registry.gitlab.com/nextensio/ux/ux-deploy:test
    docker pull registry.gitlab.com/nextensio/ux/controller-test:test

    kind load docker-image registry.gitlab.com/nextensio/ux/ux-deploy:test --name ui
    kind load docker-image registry.gitlab.com/nextensio/ux/controller-test:test --name ui

    $kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.3/manifests/namespace.yaml
    $kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.3/manifests/metallb.yaml
    $kubectl create secret generic -n metallb-system memberlist --from-literal=secretkey="$(openssl rand -base64 128)"
    $kubectl apply -f https://raw.githubusercontent.com/haproxytech/kubernetes-ingress/master/deploy/haproxy-ingress.yaml
}

function bootstrap_ui {
    my_ip=$1

    $kubectl config use-context kind-ui

    tmpf=$tmpdir/ui.yaml
    cp ui.yaml $tmpf
    sed -i "s/REPLACE_SELF_NODE_IP/$my_ip/g" $tmpf
    $kubectl apply -f $tmpf
}

mkdir $tmpdir
# Download kubectl
curl -fsL https://storage.googleapis.com/kubernetes-release/release/v1.18.5/bin/linux/amd64/kubectl -o $tmpdir/kubectl
chmod +x $tmpdir/kubectl

create_ui
ctrl_ip=`docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ui-control-plane`
bootstrap_ui $ctrl_ip

echo "######You can access the UI at http://$ctrl_ip:3000/  ############"

rm -rf $tmpdir/



