module.exports = {
  endpoint: {
    method: "get",
    path: "/examples/integration-responses"
  },
  apis: [
    {
      url: "http://api.example/api1",
      method: "get"
    },
    {
      url: "http://api.example/api2",
      method: "get"
    },
    {
      url: "http://api.example/api3",
      method: "get"
    }
  ],
  handler: (responses, helper) => {
    /**
     * Request each api and receive the response result as an array.
     * It then parses and combines each response received to create and send a new response.
     * */
    const [apiData1, apiData2, apiData3] = responses.map(res =>
      JSON.parse(res.body || "[1,2,3]")
    );
    return {
      body: {
        data: [[...apiData1, ...apiData2, ...apiData3]]
      }
    };
  }
};
