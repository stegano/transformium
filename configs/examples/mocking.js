module.exports = {
  endpoint: {
    method: "get",
    path: "/examples/mocking"
  },
  apis: [
    // If the apis fields is empty, the parser runs immediately
  ],
  handler: (_, helper) => {
    return {
      body: {
        data: [
          { id: 1, title: "Title #1" },
          { id: 2, title: "Title #2" },
          { id: 4, title: "Title #4" },
          { id: 5, title: "Title #5" },
          { id: 6, title: "Title #6" },
          { id: 7, title: "Title #7" },
          { id: 8, title: "Title #8" },
          { id: 9, title: "Title #9" }
        ]
      }
    };
  }
};
