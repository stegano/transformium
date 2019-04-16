module.exports = {
  endpoint: {
    method: "get",
    path: "/examples/error-response"
  },
  apis: [
    {
      url: "http://api.example/api",
      method: "get"
    }
  ],
  handler: (responses, helper) => {
    const res = responses[0];

    // Check for failure of API request and return error code 503.
    if ("errno" in res) {
      return {
        status: 503
      };
    }

    return {
      status: 200
    };
  }
};
