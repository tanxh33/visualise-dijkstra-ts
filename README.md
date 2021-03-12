# Visualisation of Dijkstra's Shortest Path Algorithm (TypeScript)  <img src="./img/logo.svg" height="36">

A web application for a school project - Development of a Software Application for Teaching Computer Networking.

<!-- [Try it out here](https://tanxh33.github.io/visualise-dijkstra/). -->

This is a mildly refactored version of [this existing repo](https://github.com/tanxh33/visualise-dijkstra), which was written with plain JavaScript.

This version is built with [TypeScript](https://www.typescriptlang.org/) and [MaterializeCSS](https://materializecss.com/).

Code for weighted graph implemented with reference to this article by Maiko Miyazaki: [Completed JavaScript Data Structure Course, and Here is What I Learned About Graph (+ Dijkstra Algorithm)](https://dev.to/maikomiyazaki/completed-javascript-data-structure-course-and-here-is-what-i-learned-about-graph-dijkstra-algorithm-57n8).

## Compilation
Install development packages. Note that parcel-bundler v1.12.4 has problems when trying to run or compile.
```
npm install
```

Run parcel-bundler in development mode to continuously watch the entry file .`/src/index.ts` so that it will re-compile when changes are made. You may or may not encounter an error if you have whitespaces in your absolute file path.
```
npm run dev
```

Compile TypeScript files into JavaScript for production. The compiled files are set to go into the `./js` folder.
```
npm run build
```

After either of these, you will be able to open and view the index.html file. For convenience, I use [VSCode's Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.

<!-- Tested on Firefox version 86.0 and Chrome version 88.0.4324.190. -->