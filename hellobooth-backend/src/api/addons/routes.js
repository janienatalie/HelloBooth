const routes = (handler) => [
  { method: "POST", path: "/api/addons", handler: handler.postAddonHandler },
  { method: "GET", path: "/api/addons", handler: handler.getAddonsHandler },
  {
    method: "PUT",
    path: "/api/addons/{id}",
    handler: handler.putAddonByIdHandler,
  },
  {
    method: "DELETE",
    path: "/api/addons/{id}",
    handler: handler.deleteAddonByIdHandler,
  },
];
module.exports = routes;
