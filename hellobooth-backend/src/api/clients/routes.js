// routes.js
const routes = (handler) => [
  {
    method: "POST",
    path: "/api/clients",
    handler: handler.postClientHandler,
    options: {
      auth: "jwt", // <--- KUNCI PERBAIKANNYA DI SINI
    },
  },
  {
    method: "GET",
    path: "/api/clients",
    handler: handler.getClientsHandler,
    options: {
      auth: "jwt", // <--- KUNCI PERBAIKANNYA DI SINI
    },
  },
  {
    method: "GET",
    path: "/api/clients/{id}",
    handler: handler.getClientByIdHandler,
    options: {
      auth: "jwt", // <--- KUNCI PERBAIKANNYA DI SINI
    },
  },
  {
    method: "PUT",
    path: "/api/clients/{id}",
    handler: handler.putClientByIdHandler,
    options: {
      auth: "jwt", // <--- KUNCI PERBAIKANNYA DI SINI
    },
  },
  {
    method: "DELETE",
    path: "/api/clients/{id}",
    handler: handler.deleteClientByIdHandler,
    options: {
      auth: "jwt", // <--- KUNCI PERBAIKANNYA DI SINI
    },
  },
];

module.exports = routes;
