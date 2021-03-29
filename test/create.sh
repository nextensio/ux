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

    # Create tls keys for controller (UI) and server (API)
    EXTFILE="$tmpdir/controller-extfile.conf"
    echo "subjectAltName = IP:$ctrl_ip" > "${EXTFILE}"
    # Create ssl keys/certificates for agents/connectors to establish secure websocket
    openssl req -out $tmpdir/controller.csr -newkey rsa:2048 -nodes -keyout $tmpdir/controller.key \
        -subj "/CN=$ctrl_ip/O=Nextensio Controller and Server"
    openssl x509 -req -days 365 -CA $tmpdir/rootca.crt -CAkey $tmpdir/rootca.key -set_serial 0 \
        -in $tmpdir/controller.csr -out $tmpdir/controller.crt -extfile "${EXTFILE}" -passin pass:Nextensio123
    $kubectl create secret tls controller-cert --key="$tmpdir/controller.key" --cert="$tmpdir/controller.crt"

    # metallb as a loadbalancer to map services to externally accessible IPs
    $kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.3/manifests/namespace.yaml
    $kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.3/manifests/metallb.yaml
    $kubectl create secret generic -n metallb-system memberlist --from-literal=secretkey="$(openssl rand -base64 128)"
    # hostpath-provisioner for mongodb pods to get persistent storage from kubernetes host disk
    $kubectl delete storageclass standard
    $helm repo add rimusz https://charts.rimusz.net
    $helm repo update
    $helm upgrade --install hostpath-provisioner --namespace kube-system rimusz/hostpath-provisioner
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

echo "######You can access the UI at https://$ctrl_ip/  ############"

rm -rf $tmpdir/



