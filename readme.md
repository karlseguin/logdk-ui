# logdk-ui
This is the UI for the (logdk)(https://www.github.com/karlseguin/logdk) project. It uses [lit](https://lit.dev/). 

After running `npm install`, run `make s` to launch a local development version. Currently, the local version expects a locally running logdk service. If you wish to contribute, but find this requirement painful, please let me know (it isn't something I want to spend time solving until there's a real need).

`make d` creates the production build, which the logdk build process embeds within the logdk binary.
