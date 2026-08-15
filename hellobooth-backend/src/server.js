require("dotenv").config();
const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");

const servicesPlugin = require("./api/services");
const addonsPlugin = require("./api/addons");
const clientsPlugin = require("./api/clients");

const ServicesService = require("./services/postgres/ServicesService");
const AddonsService = require("./services/postgres/AddonsService");
const ClientsService = require("./services/postgres/ClientsService");

const ServicesValidator = require("./validator/services");
const AddonsValidator = require("./validator/addons");
const ClientsValidator = require("./validator/clients");

const init = async () => {
  const servicesService = new ServicesService();
  const addonsService = new AddonsService();
  const clientsService = new ClientsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: [
          "http://localhost:3000",
          "http://127.0.0.1:3000",
          "https://hello-booth.vercel.app/",
        ],
        credentials: true,
        additionalHeaders: ["cache-control", "x-requested-with"],
      },
    },
  });

  await server.register(Jwt);

  // =======================================================
  // TRIK INTERCEPTOR: Pindah Token dari Cookie ke Header
  // =======================================================
  server.ext("onRequest", (request, h) => {
    const cookieHeader = request.headers.cookie;
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.split("=").map((c) => c.trim());
        acc[key] = value;
        return acc;
      }, {});

      // Jika ada auth_token di cookie, jadikan Bearer token
      if (cookies.auth_token && !request.headers.authorization) {
        request.headers.authorization = `Bearer ${cookies.auth_token}`;
      }
    }
    return h.continue;
  });

  // =======================================================
  // STRATEGI JWT (Tanpa cookieKey)
  // =======================================================
  server.auth.strategy("jwt", "jwt", {
    keys: process.env.JWT_SECRET || "super-secret-key-anda",
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: 86400,
    },
    validate: (artifacts, request, h) => {
      return {
        isValid: true,
        credentials: {
          id: artifacts.decoded.payload.id,
          role: artifacts.decoded.payload.role,
          sub_role: artifacts.decoded.payload.sub_role,
        },
      };
    },
  });

  await server.register([
    {
      plugin: servicesPlugin,
      options: {
        service: servicesService,
        validator: ServicesValidator,
      },
    },
    {
      plugin: addonsPlugin,
      options: {
        service: addonsService,
        validator: AddonsValidator,
      },
    },
    {
      plugin: clientsPlugin,
      options: {
        service: clientsService,
        validator: ClientsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`🚀 Server berjalan pada ${server.info.uri}`);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
