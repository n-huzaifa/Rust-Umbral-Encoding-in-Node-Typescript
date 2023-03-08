# Node/Typescript -- Rust/Umbral

This is an implementation of the [umbral encoding library from rust](https://github.com/nucypher/rust-umbral) in Node/Typescript. Use the `make` command to build the rust lib into a WASM module. Then Import the module to your project directory. Add it to the dependencies in **package.json**. This repo already has the WASM bundle here just follow the instructions below to use the package and the code.

### Prerequisites
- Make sure you have Node Js installed with its version atleast 16.0.0 or above
-  Node => `16.*.*v`

### Instructions:

- Install the dependencies and the Rust-Umbral package using `npm install`
- To compile the JS code use `npm run build`
- To run the build use `npm start`
