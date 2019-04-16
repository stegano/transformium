module.exports = {
  endpoint: {
    method: "get",
    path: "/examples/async-parser"
  },
  apis: [
    // If the apis fields is empty, the parser runs immediately
  ],
  handler: (_, helper) => {
    return new Promise(resolve => {
      /**
       * If you enable the debug flag in the `transformium.config.js` file,
       * you can see the time spent in processing in the response header.
       * */
      setTimeout(() => {
        // Return data after 2s
        resolve({
          body: {
            data: [
              { id: 1, title: `title1` },
              { id: 2, title: `title2` },
              { id: 3, title: `title3` },
              { id: 4, title: `title4` },
              { id: 5, title: `title5` },
              { id: 6, title: `title6` },
              { id: 7, title: `title7` },
              { id: 8, title: `title8` },
              { id: 9, title: `title9` }
            ]
          }
        });
      }, 2000);
    });
  }
};
