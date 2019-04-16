module.exports = {
  endpoint: {
    method: "get",
    path: "/examples/using-helper"
  },
  apis: [
    // If the apis fields is empty, the parser runs immediately
  ],
  handler: (_, helper) => {
    /**
     * The `merge` helper function is a module inserted from the` transformium.config.js` file.
     * See the `helper` field inside the `transformium.config.js` file for details.
     */
    const defaultData = helper.merge(
      {},
      {
        message: "hello :)"
      }
    );
    return {
      body: {
        data: defaultData
      }
    };
  }
};
