#!/usr/bin/env bash

tmpdir=/tmp/nextensio-ux
kubectl=$tmpdir/kubectl
helm=$tmpdir/linux-amd64/helm
export PATH=$PATH:~/go/bin

function create_ui {

    kind create cluster --name ui
    ctrl_ip=`docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ui-control-plane`

    docker pull registry.gitlab.com/nextensio/ux/controller:latest
    kind load docker-image registry.gitlab.com/nextensio/ux/ux:latest --name ui
    kind load docker-image registry.gitlab.com/nextensio/ux/controller:latest --name ui

    $kubectl create secret tls controller-cert --key=./nextensio.key --cert=./nextensio.crt

    # metallb as a loadbalancer to map services to externally accessible IPs
    $kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.3/manifests/namespace.yaml
    $kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.3/manifests/metallb.yaml
    $kubectl create secret generic -n metallb-system memberlist --from-literal=secretkey="$(openssl rand -base64 128)"
    # Mongo needs some storage, just use local storage
    $kubectl delete storageclass standard
    $kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/master/deploy/local-path-storage.yaml
}

function bootstrap_ui {
    my_ip=$1

    $kubectl config use-context kind-ui

    tmpf=$tmpdir/ui.yaml
    cp ui.yaml $tmpf
    sed -i "s/REPLACE_SELF_NODE_IP/$my_ip/g" $tmpf
    sed -i "s/REPLACE_CONTROLLER_IP/$ctrl_ip/g" $tmpf
    $kubectl apply -f $tmpf
    $kubectl apply -f mongo.yaml
}

kind delete cluster --name ui
mkdir $tmpdir
# Download kubectl
curl -fsL https://storage.googleapis.com/kubernetes-release/release/v1.18.5/bin/linux/amd64/kubectl -o $tmpdir/kubectl
chmod +x $tmpdir/kubectl
curl -fsL https://get.helm.sh/helm-v3.4.0-linux-amd64.tar.gz -o $tmpdir/helm.tgz
tar -zxvf $tmpdir/helm.tgz -C $tmpdir/
chmod +x $tmpdir/linux-amd64/helm
rm $tmpdir/helm.tgz

create_ui
bootstrap_ui $ctrl_ip

echo "######Add two lines as below to your /etc/hosts file######"
echo "$ctrl_ip controller.nextensio.net"
echo "$ctrl_ip server.nextensio.net"
echo "######These lines basically map the ip address to names, which is###########"
echo "######required to properly access the controller via browser     ###########"
echo "######You can access the UI at https://controller.nextensio.net  ############"

#rm -rf $tmpdir/



