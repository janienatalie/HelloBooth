const ClientsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "clients",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const clientsHandler = new ClientsHandler(service, validator);
    server.route(routes(clientsHandler));
  },
};
