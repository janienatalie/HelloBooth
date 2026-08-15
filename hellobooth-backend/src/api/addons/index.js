const AddonsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "addons",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const addonsHandler = new AddonsHandler(service, validator);
    server.route(routes(addonsHandler));
  },
};
