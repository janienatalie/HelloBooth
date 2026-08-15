const routes = (handler) => [
  {
    method: "POST",
    path: "/api/services",
    handler: handler.postServiceHandler,
  },
  {
    method: "GET",
    path: "/api/services",
    handler: handler.getServicesHandler,
  },
  // Tambahkan rute Edit di bawah ini
  {
    method: "PUT",
    path: "/api/services/{id}",
    handler: handler.putServiceByIdHandler,
  },
  // Tambahkan rute Hapus di bawah ini
  {
    method: "DELETE",
    path: "/api/services/{id}",
    handler: handler.deleteServiceByIdHandler,
  },
];

module.exports = routes;
