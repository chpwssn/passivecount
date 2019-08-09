_oooooo look at me! I want to read the README!_

## passivecount

It's a web service, that tells you what page load you're on in a passive-agressive way.

## why?

Because it's an example app and I can do what I want with it.

## does it have to be so passive-agressive?

Yes, [a document outlines why](README.md)

It's an example app to refresh my memory on building a [helm](https://helm.sh) chart, and [k8s](https://kubernetes.io) in general, from scratch.

## how do I run it?

    # have redis running
    yarn install
    node index.js
    # then http://localhost:3000

### but I have redis running somewhere else

🏅 fantastic job!

    REDIS_HOST=your.dank.hostname REDIS_PORT=1337 node index.js
    # then http://localhost:3000

### that's too much work

🥈 I hope you have docker-compose

    docker-compose up -d --build
    # then http://localhost:3000

#### docker-compose won't hot reload my local changes

This app doesn't really _do_ helpful things like "hot reload"

### helm?

You can deploy the app from its chart. Chances are you don't control `passive.chp.sh` so you can set the ingress host to `yourdomain.com` by deploying with:

    helm install --set ingress.hosts[0]=yourdomain.com chart/passivecount

# this code is terrible, why?

It's "vanilla" javascript with no webpack, transpilation, TypeScript, or frontend framework... of course it's terrible.
