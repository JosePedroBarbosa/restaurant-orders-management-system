const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Restaurant Orders Management System",
      version: "1.0.0",
      description: "API do trabalho prático de PAW",
    },
    tags: [
      {
        name: "Admin",
        description: "Endpoints relacionados à administração do sistema",
      },
      {
        name: "Auth",
        description: "Endpoints relacionados à autenticação de users",
      },
      {
        name: "Cart",
        description: "Endpoints relacionados à gestão do carrinho",
      },
      {
        name: "Menu",
        description: "Endpoints relacionados à gestão de menus",
      },
      {
        name: "MenuItem",
        description: "Endpoints relacionados à gestão de itens do menu",
      },
      {
        name: "Order",
        description: "Endpoints relacionados à gestão de encomendas",
      },
      {
        name: "Restaurant",
        description: "Endpoints relacionados à gestão de restaurantes",
      },
    ],
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Servidor de desenvolvimento",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {},
    },
    paths: {
      "/auth/signup": {
        post: {
          tags: ["Auth"],
          summary: "Registar novo utilizador",
          description: "Cria um novo utilizador (customer ou restaurant).",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    userName: { type: "string", example: "joaosilva" },
                    password: { type: "string", example: "secret123" },
                    confirmPassword: { type: "string", example: "secret123" },
                    fullName: { type: "string", example: "João Silva" },
                    street: { type: "string", example: "Rua das Flores" },
                    city: { type: "string", example: "Lisboa" },
                    postalCode: { type: "string", example: "1000-001" },
                    role: {
                      type: "string",
                      enum: ["customer", "restaurant"],
                      example: "customer",
                    },
                  },
                  required: [
                    "userName",
                    "password",
                    "confirmPassword",
                    "fullName",
                    "street",
                    "city",
                    "postalCode",
                    "role",
                  ],
                },
              },
            },
          },
          responses: {
            201: {
              description: "Utilizador registado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      token: { type: "string" },
                      user: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          userName: { type: "string" },
                          fullName: { type: "string" },
                          address: {
                            type: "object",
                            properties: {
                              street: { type: "string" },
                              city: { type: "string" },
                              postalCode: { type: "string" },
                            },
                          },
                          role: { type: "string" },
                          isValidated: { type: "boolean" },
                        },
                      },
                    },
                    example: {
                      message: "User registered successfully",
                      token:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODFlODA1ZDY3NTFiNDViYTQzZjZmNmEiLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NDY4Mjk0MDUsImV4cCI6MTc0NzQzNDIwNX0.AjzPrIJS6LT3FmfMm_u_JGH4Hw1I2Hn3GAdoCXNn-70",
                      user: {
                        _id: "681e805d6751b45ba43f6f6a",
                        userName: "joaosilva",
                        fullName: "João Silva",
                        address: {
                          street: "Rua das Flores",
                          city: "Lisboa",
                          postalCode: "1000-001",
                        },
                        role: "customer",
                        isValidated: false,
                      },
                    },
                  },
                },
              },
            },
            400: { description: "Dados inválidos ou utilizador já existe" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login de utilizador",
          description: "Autentica um utilizador.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    userName: { type: "string", example: "joaosilva" },
                    password: { type: "string", example: "secret123" },
                  },
                  required: ["userName", "password"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login efetuado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "Login successful" },
                      token: { type: "string", example: "JWT_TOKEN_AQUI" },
                      user: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          userName: { type: "string" },
                          fullName: { type: "string" },
                          role: { type: "string" },
                          isValidated: { type: "boolean" },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: "Credenciais ausentes" },
            401: { description: "Credenciais inválidas" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/auth/profileInfo": {
        get: {
          tags: ["Auth"],
          summary: "Obter informações de perfil",
          description: "Retorna os dados do utilizador autenticado.",
          security: [{ bearerAuth: [] }],
          responses: {
            201: {
              description: "Informações do perfil obtidas com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "User profile information",
                      },
                      user: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          userName: { type: "string" },
                          fullName: { type: "string" },
                          address: { type: "object" },
                          role: { type: "string" },
                          isValidated: { type: "boolean" },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Não autorizado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/admin/getAllCategories": {
        get: {
          tags: ["Admin"],
          summary: "Listar todas as categorias",
          description:
            "Obtém a lista de todas as categorias para atribuir a pratos disponíveis.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Lista de categorias obtida com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      categories: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            name: { type: "string" },
                          },
                        },
                        example: [
                          {
                            _id: "67f91302b4e0d271e8cab780",
                            name: "Meat",
                          },
                          {
                            _id: "67f91307b4e0d271e8cab78b",
                            name: "Fish",
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Não autorizado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/admin/getAllMenus": {
        get: {
          tags: ["Admin"],
          summary: "Listar todos os menus",
          description: "Obtém todos os menus existentes na plataforma.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Menus listados com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      menus: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            name: { type: "string" },
                            description: { type: "string" },
                            restaurant: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                name: { type: "string" },
                              },
                            },
                          },
                        },
                        example: [
                          {
                            _id: "681b8fb38488a1f60748864e",
                            name: "Sabores da Costa",
                            description:
                              "Menu dedicado aos sabores tradicionais da costa portuguesa, com destaque para mariscos frescos e grelhados ao estilo regional.",
                            restaurant: {
                              _id: "681b8a7dca96f65e81408d5d",
                              name: "Maré Viva",
                            },
                          },
                          {
                            _id: "681b95227b83b70728b5c3d9",
                            name: "Gourmet Douro",
                            description:
                              "Uma seleção exclusiva de pratos que celebram os sabores autênticos do Douro com um toque contemporâneo.",
                            restaurant: {
                              _id: "681b94b37b83b70728b5c3b2",
                              name: "Sabores da Margem",
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Não autorizado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/admin/getAllOrders": {
        get: {
          tags: ["Admin"],
          summary: "Listar todas as encomendas",
          description: "Obtém todas as encomendas efetuadas na plataforma.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Encomendas listadas com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      orders: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            customer: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                fullName: { type: "string" },
                              },
                            },
                            restaurant: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                name: { type: "string" },
                                address: {
                                  type: "object",
                                  properties: {
                                    street: { type: "string" },
                                    city: { type: "string" },
                                    postalCode: { type: "string" },
                                  },
                                },
                              },
                            },
                            deliveryDetails: {
                              type: "object",
                              properties: {
                                street: { type: "string" },
                                city: { type: "string" },
                                postalCode: { type: "string" },
                              },
                            },
                            orderItems: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  menuItem: {
                                    type: "object",
                                    properties: {
                                      _id: { type: "string" },
                                      name: { type: "string" },
                                    },
                                  },
                                  portionName: { type: "string" },
                                  portionPrice: { type: "number" },
                                  quantity: { type: "integer" },
                                  subtotal: { type: "number" },
                                },
                              },
                            },
                            totalPrice: { type: "number" },
                            status: { type: "string" },
                            deliveryType: { type: "string" },
                            paymentMethod: { type: "string" },
                            customerNote: { type: "string" },
                            customerPhone: { type: "string" },
                            paymentStatus: { type: "string" },
                            createdAt: { type: "string", format: "date-time" },
                            updatedAt: { type: "string", format: "date-time" },
                            review: {
                              type: "object",
                              properties: {
                                rating: { type: "number" },
                                comment: { type: "string" },
                                photo: { type: "string" },
                                createdAt: {
                                  type: "string",
                                  format: "date-time",
                                },
                              },
                            },
                          },
                        },
                        example: [
                          {
                            _id: "681c77f694142d9c42b5a811",
                            customer: {
                              _id: "681b845bca96f65e81408d18",
                              fullName: "João Silva",
                            },
                            restaurant: {
                              _id: "681b8a7dca96f65e81408d5d",
                              name: "Maré Viva",
                              address: {
                                street: "Avenida Marginal, 120",
                                city: "Cascais",
                                postalCode: "2750-427",
                              },
                            },
                            deliveryDetails: {
                              street: "Street",
                              city: "City",
                              postalCode: "1000-123",
                            },
                            orderItems: [
                              {
                                menuItem: {
                                  _id: "681b92961986bee19fbf2782",
                                  name: "Sardinhas Assadas",
                                },
                                portionName: "Dose Tradicional",
                                portionPrice: 9.5,
                                quantity: 2,
                                subtotal: 19,
                              },
                            ],
                            totalPrice: 19,
                            status: "delivered",
                            deliveryType: "delivery",
                            paymentMethod: "cash",
                            customerNote: "No onions",
                            customerPhone: "912345678",
                            paymentStatus: "paid",
                            createdAt: "2025-05-08T09:23:02.823Z",
                            updatedAt: "2025-05-08T09:24:58.143Z",
                          },
                          {
                            _id: "681e4431000a62471d0f14ab",
                            customer: {
                              _id: "681b845bca96f65e81408d18",
                              fullName: "João Silva",
                            },
                            restaurant: {
                              _id: "681b8a7dca96f65e81408d5d",
                              name: "Maré Viva",
                              address: {
                                street: "Avenida Marginal, 120",
                                city: "Cascais",
                                postalCode: "2750-427",
                              },
                            },
                            deliveryDetails: {
                              street: "Street",
                              city: "City",
                              postalCode: "1000-001",
                            },
                            orderItems: [
                              {
                                menuItem: {
                                  _id: "681b92961986bee19fbf2782",
                                  name: "Sardinhas Assadas",
                                },
                                portionName: "Dose Familiar",
                                portionPrice: 16,
                                quantity: 1,
                                subtotal: 16,
                              },
                            ],
                            totalPrice: 16,
                            status: "delivered",
                            deliveryType: "delivery",
                            paymentMethod: "online",
                            customerNote: "leave at the door.",
                            customerPhone: "912345678",
                            paymentStatus: "paid",
                            createdAt: "2025-05-09T18:06:41.150Z",
                            updatedAt: "2025-05-09T18:11:16.186Z",
                            review: {
                              rating: 4.4,
                              comment: "Comida agradável",
                              photo: "uploads\\1746814276130.png",
                              createdAt: "2025-05-09T18:11:16.185Z",
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Não autorizado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/admin/restaurantsToValidate": {
        get: {
          tags: ["Admin"],
          summary: "Listar restaurantes por validar",
          description:
            "Obtém todos os utilizadores com role 'restaurant' e não validados.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Restaurantes por validar listados com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      restaurants: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            userName: { type: "string" },
                            fullName: { type: "string" },
                          },
                        },
                        example: [
                          {
                            _id: "681b84bfca96f65e81408d2b",
                            userName: "mareviva",
                            fullName: "Restaurante Maré Viva",
                          },
                          {
                            _id: "681b943a7b83b70728b5c38f",
                            userName: "saboresmargem",
                            fullName: "Sabores da Margem",
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Não autorizado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/admin/validateRestaurant/{id}": {
        post: {
          tags: ["Admin"],
          summary: "Validar restaurante por ID",
          description:
            "Valida um utilizador com role 'restaurant' através do seu ID.",
          security: [{ jwt: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
              description: "ID do restaurante a validar",
            },
          ],
          responses: {
            200: {
              description: "Restaurante validado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      restaurant: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          userName: { type: "string" },
                          fullName: { type: "string" },
                          role: { type: "string" },
                          isValidated: { type: "boolean" },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: "ID inválido" },
            404: { description: "Restaurante não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/admin/removeRestaurant/{id}": {
        delete: {
          tags: ["Admin"],
          summary: "Remover restaurante e dados associados",
          description:
            "Remove um restaurante e todos os seus menus e menu items associados.",
          security: [{ jwt: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
              description: "ID do restaurante a remover",
            },
          ],
          responses: {
            200: {
              description: "Restaurante removido com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example:
                          "Restaurant and all related data removed successfully",
                      },
                      restaurantId: { type: "string" },
                    },
                  },
                },
              },
            },
            400: { description: "ID inválido" },
            404: { description: "Restaurante não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/admin/createCategory": {
        post: {
          tags: ["Admin"],
          summary: "Criar nova categoria",
          description:
            "Cria uma nova categoria para atribuir a um prato no sistema.",
          security: [{ jwt: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Massas" },
                  },
                  required: ["name"],
                },
              },
            },
          },
          responses: {
            201: {
              description: "Categoria criada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      category: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          name: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: "Dados inválidos ou categoria já existente" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/admin/removeCategory/{id}": {
        delete: {
          tags: ["Admin"],
          summary: "Remover categoria",
          description: "Remove uma categoria existente através do seu ID.",
          security: [{ jwt: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID da categoria a remover",
            },
          ],
          responses: {
            200: {
              description: "Categoria removida com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Category removed successfully",
                      },
                      categoryId: { type: "string" },
                    },
                  },
                },
              },
            },
            400: { description: "ID inválido" },
            404: { description: "Categoria não encontrada" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/admin/deleteMenu/{restaurantId}/{id}": {
        delete: {
          tags: ["Admin"],
          summary: "Remover menu de restaurante",
          description: "Remove um menu específico associado a um restaurante.",
          security: [{ jwt: [] }],
          parameters: [
            {
              name: "restaurantId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID do restaurante",
            },
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID do menu a remover",
            },
          ],
          responses: {
            200: {
              description: "Menu removido com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Menu deleted from restaurant successfully",
                      },
                      restaurantId: { type: "string" },
                    },
                  },
                },
              },
            },
            400: { description: "IDs inválidos" },
            404: { description: "Menu ou restaurante não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/admin/createRestaurantMenu": {
        post: {
          tags: ["Admin"],
          summary: "Criar novo menu para um restaurante",
          description:
            "Permite ao administrador criar um menu associado a um restaurante específico.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      example: "Menu Executivo",
                    },
                    description: {
                      type: "string",
                      example:
                        "Menu disponível durante a semana, das 12h às 15h",
                    },
                    restaurantId: {
                      type: "string",
                      example: "681b8a7dca96f65e81408d5d",
                    },
                    image: {
                      type: "string",
                      format: "binary",
                    },
                  },
                  required: ["name", "description", "restaurantId", "image"],
                },
              },
            },
          },
          responses: {
            201: {
              description: "Menu criado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Menu created successfully by admin.",
                      },
                      menu: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          name: { type: "string" },
                          description: { type: "string" },
                          image: { type: "string" },
                          restaurant: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Dados inválidos ou imagem ausente",
            },
            404: {
              description: "Restaurante não encontrado",
            },
            500: {
              description: "Erro interno do servidor",
            },
          },
        },
      },
      "/admin/deleteMenuItem/{restaurantId}/{id}": {
        delete: {
          tags: ["Admin"],
          summary: "Remover menu item de restaurante",
          description:
            "Remove um menuItem de menu de um restaurante e de todos os menus associados.",
          security: [{ jwt: [] }],
          parameters: [
            {
              name: "restaurantId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID do restaurante",
            },
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID do menu item a remover",
            },
          ],
          responses: {
            200: {
              description: "Menu Item removido com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example:
                          "MenuItem deleted successfully, removed from restaurant and menus.",
                      },
                      restaurantId: { type: "string" },
                    },
                  },
                },
              },
            },
            400: { description: "IDs inválidos" },
            404: { description: "Menu Item ou restaurante não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/admin/eligibleUsersForRestaurant": {
        get: {
          tags: ["Admin"],
          summary: "Listar utilizadores elegíveis para criação de restaurante",
          description:
            "Retorna todos os utilizadores com role 'restaurant', validados e que ainda não possuem um restaurante atribuído.",
          security: [{ jwt: [] }],
          responses: {
            200: {
              description: "Lista de utilizadores elegíveis",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      eligibleUsers: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            userName: { type: "string" },
                            fullName: { type: "string" },
                          },
                        },
                        example: [
                          {
                            _id: "681fbfd26e590ad1c35685da",
                            userName: "Restaurant3",
                            fullName: "Restaurant Owner 3",
                          },
                          {
                            _id: "6820d2b71973a1e5b25304ac",
                            userName: "Customer2",
                            fullName: "Customer2",
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/admin/createRestaurantAsAdmin": {
        post: {
          tags: ["Admin"],
          summary: "Criar restaurante para um utilizador",
          description:
            "Cria um restaurante atribuído a um utilizador com role 'restaurant', validado, e que ainda não possua restaurante.",
          security: [{ jwt: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: [
                    "userId",
                    "name",
                    "description",
                    "street",
                    "city",
                    "postalCode",
                    "maxDeliveryRadius",
                    "deliveryTime",
                    "maxOrdersPerHour",
                    "preparationTime",
                    "image",
                  ],
                  properties: {
                    userId: {
                      type: "string",
                      example: "681fbfd26e590ad1c35685da",
                    },
                    name: { type: "string", example: "Restaurante do Bairro" },
                    description: {
                      type: "string",
                      example:
                        "Especialidades regionais e pratos tradicionais.",
                    },
                    street: { type: "string", example: "Rua das Oliveiras" },
                    city: { type: "string", example: "Lisboa" },
                    postalCode: { type: "string", example: "1000-123" },
                    maxDeliveryRadius: { type: "number", example: 5 },
                    deliveryTime: { type: "number", example: 30 },
                    maxOrdersPerHour: { type: "number", example: 20 },
                    preparationTime: { type: "number", example: 25 },
                    image: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Restaurante criado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Restaurant created successfully for user.",
                      },
                      restaurant: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          name: { type: "string" },
                          description: { type: "string" },
                          address: {
                            type: "object",
                            properties: {
                              street: { type: "string" },
                              city: { type: "string" },
                              postalCode: { type: "string" },
                            },
                          },
                          deliverySettings: {
                            type: "object",
                            properties: {
                              maxDeliveryRadius: { type: "number" },
                              deliveryTime: { type: "number" },
                              maxOrdersPerHour: { type: "number" },
                              preparationTime: { type: "number" },
                            },
                          },
                          image: { type: "string" },
                          owner: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Dados inválidos ou utilizador não é elegível",
            },
            500: {
              description: "Erro interno do servidor",
            },
          },
        },
      },
      "/admin/removeOrder/{orderId}": {
        delete: {
          tags: ["Admin"],
          summary: "Remover encomenda",
          description: "Remove uma encomenda com base no seu ID.",
          security: [{ jwt: [] }],
          parameters: [
            {
              name: "orderId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID da encomenda a remover",
            },
          ],
          responses: {
            200: {
              description: "Encomenda removida com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Order deleted successfully",
                      },
                    },
                  },
                },
              },
            },
            400: { description: "ID inválido" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/admin/monthlyOrders": {
        get: {
          tags: ["Admin"],
          summary: "Obter estatísticas mensais de encomendas",
          description:
            "Retorna o número de encomendas entregues por mês no ano atual.",
          security: [{ jwt: [] }],
          responses: {
            200: {
              description: "Estatísticas obtidas com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      monthlyOrders: {
                        type: "array",
                        items: { type: "number" },
                        example: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                      },
                    },
                  },
                },
              },
            },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/cart/addItem": {
        post: {
          tags: ["Cart"],
          summary: "Adicionar item ao carrinho",
          description:
            "Adiciona um item ao carrinho do utilizador autenticado.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: [
                    "menuItem",
                    "portionName",
                    "portionPrice",
                    "quantity",
                  ],
                  properties: {
                    menuItem: { type: "string" },
                    portionName: { type: "string" },
                    portionPrice: { type: "number" },
                    quantity: { type: "integer" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Item adicionado com sucesso" },
            400: {
              description: "Dados inválidos ou item já existe no carrinho",
            },
            404: { description: "MenuItem não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/cart/removeItem/{menuItemId}/{portionName}": {
        delete: {
          tags: ["Cart"],
          summary: "Remover item do carrinho",
          description: "Remove um item específico do carrinho.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "menuItemId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "portionName",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Item removido com sucesso" },
            400: { description: "ID inválido" },
            404: { description: "Item ou carrinho não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/cart/updateItemQuantity/{menuItemId}/{portionName}": {
        put: {
          tags: ["Cart"],
          summary: "Atualizar quantidade de item",
          description: "Atualiza a quantidade de um item no carrinho.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "menuItemId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "portionName",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["quantity"],
                  properties: {
                    quantity: { type: "integer" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Quantidade atualizada com sucesso" },
            400: { description: "Dados inválidos" },
            404: { description: "Item ou carrinho não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/cart/clearCart": {
        delete: {
          tags: ["Cart"],
          summary: "Limpar carrinho",
          description: "Remove todos os itens do carrinho do utilizador.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Carrinho limpo com sucesso" },
            404: { description: "Carrinho não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/cart/submitOrder": {
        post: {
          tags: ["Cart"],
          summary: "Submeter encomenda",
          description: "Submete o carrinho como uma nova encomenda.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: [
                    "street",
                    "city",
                    "postalCode",
                    "deliveryType",
                    "paymentMethod",
                    "customerPhone",
                  ],
                  properties: {
                    street: { type: "string" },
                    city: { type: "string" },
                    postalCode: { type: "string" },
                    deliveryType: { type: "string" },
                    paymentMethod: { type: "string" },
                    customerPhone: { type: "string" },
                    customerNote: { type: "string" },
                    citizenCardNumber: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Encomenda criada com sucesso" },
            400: { description: "Carrinho vazio ou dados inválidos" },
            403: { description: "Cliente bloqueado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/cart/getCart": {
        get: {
          tags: ["Cart"],
          summary: "Obter carrinho pessoal",
          description: "Retorna o carrinho do utilizador autenticado.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Carrinho obtido com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      cart: { type: "object" },
                    },
                    example: {
                      cart: {
                        _id: "681bd07dbf316982e4411412",
                        userId: "681b845bca96f65e81408d18",
                        items: [
                          {
                            menuItem: {
                              _id: "681b92961986bee19fbf2782",
                              restaurant: "681b8a7dca96f65e81408d5d",
                              name: "Sardinhas Assadas",
                              description:
                                "Sardinhas grelhadas na brasa com batata cozida e salada.",
                              category: "67f91307b4e0d271e8cab78b",
                              images: ["uploads/1746637462862.png"],
                              nutritionalInfo: {
                                calories: 420,
                                proteins: 28,
                                carbs: 20,
                                fats: 24,
                                _id: "681b92961986bee19fbf2783",
                              },
                              portions: [
                                {
                                  name: "Dose Tradicional",
                                  price: 9.5,
                                  _id: "681b92961986bee19fbf2784",
                                },
                                {
                                  name: "Dose Familiar",
                                  price: 16,
                                  _id: "681b9323347f803705fd69c5",
                                },
                              ],
                              createdAt: "2025-05-07T17:04:22.984Z",
                              updatedAt: "2025-05-10T20:09:06.272Z",
                              __v: 5,
                            },
                            portionName: "Dose Tradicional",
                            portionPrice: 9.5,
                            quantity: 1,
                            restaurantId: "681b8a7dca96f65e81408d5d",
                          },
                        ],
                        createdAt: "2025-05-07T21:28:29.298Z",
                        updatedAt: "2025-05-11T17:25:01.712Z",
                        __v: 193,
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Não autorizado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/restaurants/createRestaurant": {
        post: {
          tags: ["Restaurant"],
          summary: "Criar um novo restaurante",
          description:
            "Cria um restaurante com as informações fornecidas, incluindo a imagem.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Restaurante Maré Viva" },
                    street: {
                      type: "string",
                      example: "Avenida Marginal, 120",
                    },
                    city: { type: "string", example: "Cascais" },
                    postalCode: { type: "string", example: "2750-427" },
                    description: {
                      type: "string",
                      example: "Especialidades portuguesas",
                    },
                    maxDeliveryRadius: { type: "number", example: 10 },
                    deliveryTime: { type: "number", example: 45 },
                    maxOrdersPerHour: { type: "number", example: 15 },
                    preparationTime: { type: "number", example: 30 },
                    image: { type: "string", format: "binary" },
                  },
                  required: [
                    "name",
                    "street",
                    "city",
                    "postalCode",
                    "description",
                    "maxDeliveryRadius",
                    "deliveryTime",
                    "maxOrdersPerHour",
                    "preparationTime",
                    "image",
                  ],
                },
              },
            },
          },
          responses: {
            201: {
              description: "Restaurante criado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Restaurant created successfully",
                      },
                      restaurant: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          name: { type: "string" },
                          description: { type: "string" },
                          address: {
                            type: "object",
                            properties: {
                              street: { type: "string" },
                              city: { type: "string" },
                              postalCode: { type: "string" },
                            },
                          },
                          deliverySettings: {
                            type: "object",
                            properties: {
                              maxDeliveryRadius: { type: "number" },
                              deliveryTime: { type: "number" },
                              maxOrdersPerHour: { type: "number" },
                              preparationTime: { type: "number" },
                            },
                          },
                          image: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: "Dados inválidos" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/restaurants/updateRestaurant/{id}": {
        put: {
          tags: ["Restaurant"],
          summary: "Atualizar um restaurante",
          description: "Atualiza as informações de um restaurante específico.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID do restaurante a ser atualizado",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Restaurante Maré Viva" },
                    street: {
                      type: "string",
                      example: "Avenida Marginal, 120",
                    },
                    city: { type: "string", example: "Cascais" },
                    postalCode: { type: "string", example: "2750-427" },
                    description: {
                      type: "string",
                      example: "Especialidades portuguesas",
                    },
                    maxDeliveryRadius: { type: "number", example: 10 },
                    deliveryTime: { type: "number", example: 45 },
                    maxOrdersPerHour: { type: "number", example: 15 },
                    preparationTime: { type: "number", example: 30 },
                    image: { type: "string", format: "binary" },
                  },
                  required: [
                    "name",
                    "street",
                    "city",
                    "postalCode",
                    "description",
                    "maxDeliveryRadius",
                    "deliveryTime",
                    "maxOrdersPerHour",
                    "preparationTime",
                  ],
                },
              },
            },
          },
          responses: {
            200: {
              description: "Restaurante atualizado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Restaurant updated successfully",
                      },
                      restaurant: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          name: { type: "string" },
                          description: { type: "string" },
                          address: {
                            type: "object",
                            properties: {
                              street: { type: "string" },
                              city: { type: "string" },
                              postalCode: { type: "string" },
                            },
                          },
                          deliverySettings: {
                            type: "object",
                            properties: {
                              maxDeliveryRadius: { type: "number" },
                              deliveryTime: { type: "number" },
                              maxOrdersPerHour: { type: "number" },
                              preparationTime: { type: "number" },
                            },
                          },
                          image: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: "Dados inválidos" },
            404: { description: "Restaurante não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/restaurants/restaurant/{id}": {
        get: {
          tags: ["Restaurant"],
          summary: "Obter informações de um restaurante por ID",
          description:
            "Retorna as informações completas de um restaurante, incluindo menus, menu items e estatísticas adicionais.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID do restaurante",
            },
          ],
          responses: {
            200: {
              description: "Informações do restaurante obtidas com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      _id: { type: "string" },
                      name: { type: "string" },
                      address: {
                        type: "object",
                        properties: {
                          street: { type: "string" },
                          city: { type: "string" },
                          postalCode: { type: "string" },
                        },
                      },
                      description: { type: "string" },
                      deliverySettings: {
                        type: "object",
                        properties: {
                          maxDeliveryRadius: { type: "number" },
                          deliveryTime: { type: "number" },
                          maxOrdersPerHour: { type: "number" },
                          preparationTime: { type: "number" },
                        },
                      },
                      image: { type: "string" },
                      owner: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          name: { type: "string" },
                        },
                      },
                      menus: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            name: { type: "string" },
                            description: { type: "string" },
                            image: { type: "string" },
                            menuItems: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  _id: { type: "string" },
                                  name: { type: "string" },
                                  description: { type: "string" },
                                  category: { type: "string" },
                                  images: {
                                    type: "array",
                                    items: { type: "string" },
                                  },
                                  nutritionalInfo: {
                                    type: "object",
                                    properties: {
                                      calories: { type: "number" },
                                      proteins: { type: "number" },
                                      carbs: { type: "number" },
                                      fats: { type: "number" },
                                    },
                                  },
                                  portions: {
                                    type: "array",
                                    items: {
                                      type: "object",
                                      properties: {
                                        name: { type: "string" },
                                        price: { type: "number" },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      allMenuItems: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            name: { type: "string" },
                            description: { type: "string" },
                            category: { type: "string" },
                            images: {
                              type: "array",
                              items: { type: "string" },
                            },
                            nutritionalInfo: {
                              type: "object",
                              properties: {
                                calories: { type: "number" },
                                proteins: { type: "number" },
                                carbs: { type: "number" },
                                fats: { type: "number" },
                              },
                            },
                            portions: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  name: { type: "string" },
                                  price: { type: "number" },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: "ID inválido" },
            404: { description: "Restaurante não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/restaurants/allRestaurants": {
        get: {
          tags: ["Restaurant"],
          summary: "Listar todos os restaurantes",
          description:
            "Obtém a lista de todos os restaurantes registados no sistema.",
          responses: {
            200: {
              description: "Lista de restaurantes obtida com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      restaurants: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            name: { type: "string" },
                            address: {
                              type: "object",
                              properties: {
                                street: { type: "string" },
                                city: { type: "string" },
                                postalCode: { type: "string" },
                              },
                            },
                            description: { type: "string" },
                            deliverySettings: {
                              type: "object",
                              properties: {
                                maxDeliveryRadius: { type: "number" },
                                deliveryTime: { type: "number" },
                                maxOrdersPerHour: { type: "number" },
                                preparationTime: { type: "number" },
                              },
                            },
                            image: { type: "string" },
                            owner: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                name: { type: "string" },
                              },
                            },
                          },
                        },
                        example: [
                          {
                            _id: "681b8a7dca96f65e81408d5d",
                            name: "Maré Viva",
                            address: {
                              street: "Avenida Marginal, 120",
                              city: "Cascais",
                              postalCode: "2750-427",
                            },
                            description:
                              "Restaurante de especialidades portuguesas com enfoque em mariscos e grelhados frescos. Ambiente acolhedor junto ao rio.",
                            deliverySettings: {
                              maxDeliveryRadius: 10,
                              deliveryTime: 45,
                              maxOrdersPerHour: 15,
                              preparationTime: 30,
                            },
                            image: "uploads\\1746636320502.png",
                            owner: {
                              _id: "681b84bfca96f65e81408d2b",
                              name: "João Silva",
                            },
                          },
                          {
                            _id: "681b94b37b83b70728b5c3b2",
                            name: "Sabores da Margem",
                            address: {
                              street: "Cais da Ribeira, 42",
                              city: "Porto",
                              postalCode: "4050-510",
                            },
                            description:
                              "Situado nas margens do rio Douro, o nosso restaurante oferece uma experiência gastronómica única com vista privilegiada.",
                            deliverySettings: {
                              maxDeliveryRadius: 8,
                              deliveryTime: 40,
                              maxOrdersPerHour: 12,
                              preparationTime: 25,
                            },
                            image: "uploads\\1746638003392.png",
                            owner: {
                              _id: "681b943a7b83b70728b5c38f",
                              name: "Maria Oliveira",
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/restaurants/reviewStats/{restaurantId}": {
        get: {
          tags: ["Restaurant"],
          summary: "Obter estatísticas de avaliações de restaurante",
          description:
            "Retorna a média de avaliações e o total de avaliações de um restaurante.",
          parameters: [
            {
              name: "restaurantId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description:
                "ID do restaurante para obter as estatísticas de avaliação",
            },
          ],
          responses: {
            200: {
              description: "Estatísticas de avaliações obtidas com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      averageRating: { type: "number" },
                      totalReviews: { type: "number" },
                    },
                  },
                },
              },
            },
            404: { description: "Restaurante não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/restaurants/updateRestaurantData": {
        get: {
          tags: ["Restaurant"],
          summary: "Obter dados para atualização do restaurante",
          description:
            "Obtém os dados necessários para preencher o painel de administração de um restaurante, incluindo categorias, menus e menu items.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Dados de atualização obtidos com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      restaurant: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          name: { type: "string" },
                          address: {
                            type: "object",
                            properties: {
                              street: { type: "string" },
                              city: { type: "string" },
                              postalCode: { type: "string" },
                            },
                          },
                          description: { type: "string" },
                          deliverySettings: {
                            type: "object",
                            properties: {
                              maxDeliveryRadius: { type: "number" },
                              deliveryTime: { type: "number" },
                              maxOrdersPerHour: { type: "number" },
                              preparationTime: { type: "number" },
                            },
                          },
                          image: { type: "string" },
                        },
                      },
                      categories: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            name: { type: "string" },
                          },
                        },
                      },
                      menus: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            name: { type: "string" },
                            description: { type: "string" },
                          },
                        },
                      },
                      menuItems: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            name: { type: "string" },
                            description: { type: "string" },
                            category: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                name: { type: "string" },
                              },
                            },
                            images: {
                              type: "array",
                              items: { type: "string" },
                            },
                            nutritionalInfo: {
                              type: "object",
                              properties: {
                                calories: { type: "number" },
                                proteins: { type: "number" },
                                carbs: { type: "number" },
                                fats: { type: "number" },
                              },
                            },
                            portions: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  name: { type: "string" },
                                  price: { type: "number" },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Não autorizado" },
            404: { description: "Restaurante não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/orders/order/{id}": {
        get: {
          tags: ["Order"],
          summary: "Obter informações de uma encomenda por ID",
          description:
            "Retorna os detalhes completos de uma encomenda, incluindo o cliente, restaurante e itens do menu.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID da encomenda",
            },
          ],
          responses: {
            200: {
              description: "Informações da encomenda obtidas com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      _id: { type: "string" },
                      status: { type: "string" },
                      createdAt: { type: "string", format: "date-time" },
                      customer: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          fullName: { type: "string" },
                        },
                      },
                      restaurant: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          name: { type: "string" },
                        },
                      },
                      orderItems: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            menuItem: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                name: { type: "string" },
                              },
                            },
                            quantity: { type: "integer" },
                            portionName: { type: "string" },
                            portionPrice: { type: "number" },
                          },
                        },
                      },
                      totalPrice: { type: "number" },
                      deliveryDetails: {
                        type: "object",
                        properties: {
                          street: { type: "string" },
                          city: { type: "string" },
                          postalCode: { type: "string" },
                        },
                      },
                    },
                  },
                  example: {
                    _id: "12345",
                    status: "delivered",
                    createdAt: "2025-05-12T14:23:00.000Z",
                    customer: { _id: "54321", fullName: "João Silva" },
                    restaurant: { _id: "98765", name: "Maré Viva" },
                    orderItems: [
                      {
                        menuItem: { _id: "111", name: "Sardinhas Assadas" },
                        quantity: 2,
                        portionName: "Dose Tradicional",
                        portionPrice: 9.5,
                      },
                    ],
                    totalPrice: 19,
                    deliveryDetails: {
                      street: "Avenida Marginal, 120",
                      city: "Cascais",
                      postalCode: "2750-427",
                    },
                  },
                },
              },
            },
            400: { description: "ID inválido" },
            404: { description: "Encomenda não encontrada" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/orders/orders/{restaurantId}": {
        get: {
          tags: ["Order"],
          summary: "Obter as encomendas de um restaurante",
          description:
            "Retorna todas as encomendas de um restaurante que ainda não foram entregues ou canceladas.",
          parameters: [
            {
              name: "restaurantId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID do restaurante",
            },
          ],
          responses: {
            200: {
              description: "Encomendas do restaurante obtidas com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      orders: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            status: { type: "string" },
                            createdAt: { type: "string", format: "date-time" },
                            customer: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                fullName: { type: "string" },
                              },
                            },
                            restaurant: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                name: { type: "string" },
                              },
                            },
                            totalPrice: { type: "number" },
                          },
                        },
                      },
                    },
                  },
                  example: {
                    orders: [
                      {
                        _id: "12345",
                        status: "pending",
                        createdAt: "2025-05-12T14:23:00.000Z",
                        customer: { _id: "54321", fullName: "João Silva" },
                        restaurant: { _id: "98765", name: "Maré Viva" },
                        totalPrice: 19,
                      },
                      {
                        _id: "12346",
                        status: "inProgress",
                        createdAt: "2025-05-12T14:30:00.000Z",
                        customer: { _id: "54322", fullName: "Maria Oliveira" },
                        restaurant: { _id: "98765", name: "Maré Viva" },
                        totalPrice: 24.5,
                      },
                    ],
                  },
                },
              },
            },
            400: { description: "ID inválido" },
            404: { description: "Restaurante não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/orders/history/{userId}": {
        get: {
          tags: ["Order"],
          summary: "Obter o histórico de encomendas de um restaurante",
          description:
            "Retorna todas as encomendas de um restaurante, mas apenas aquelas que foram entregues ou canceladas.",
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID do restaurante (proprietário)",
            },
          ],
          responses: {
            200: {
              description: "Histórico de encomendas obtido com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      orders: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            status: { type: "string" },
                            createdAt: { type: "string", format: "date-time" },
                            customer: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                fullName: { type: "string" },
                              },
                            },
                            restaurant: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                name: { type: "string" },
                              },
                            },
                            totalPrice: { type: "number" },
                          },
                        },
                      },
                    },
                  },
                  example: {
                    orders: [
                      {
                        _id: "12345",
                        status: "delivered",
                        createdAt: "2025-05-12T14:23:00.000Z",
                        customer: { _id: "54321", fullName: "João Silva" },
                        restaurant: { _id: "98765", name: "Maré Viva" },
                        totalPrice: 19,
                      },
                      {
                        _id: "12346",
                        status: "cancelled",
                        createdAt: "2025-05-11T14:30:00.000Z",
                        customer: { _id: "54322", fullName: "Maria Oliveira" },
                        restaurant: { _id: "98765", name: "Maré Viva" },
                        totalPrice: 24.5,
                      },
                    ],
                  },
                },
              },
            },
            400: { description: "ID inválido" },
            404: { description: "Restaurante não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/orders/updateStatus/{orderId}": {
        put: {
          tags: ["Order"],
          summary: "Atualizar o status de uma encomenda",
          description:
            "Atualiza o status de uma encomenda, de acordo com o papel do usuário (restaurante ou cliente).",
          parameters: [
            {
              name: "orderId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID da encomenda a ser atualizada",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: [
                        "pending",
                        "confirmed",
                        "inProgress",
                        "outForDelivery",
                        "delivered",
                        "cancelled",
                      ],
                      example: "delivered",
                    },
                  },
                  required: ["status"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "Status da encomenda atualizado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      order: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          status: { type: "string" },
                        },
                      },
                    },
                  },
                  example: {
                    message: "Order status updated successfully",
                    order: {
                      _id: "12345",
                      status: "delivered",
                    },
                  },
                },
              },
            },
            400: { description: "Dados inválidos" },
            404: { description: "Encomenda não encontrada" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/orders/review/{orderId}": {
        post: {
          tags: ["Order"],
          summary: "Submeter uma avaliação para uma encomenda",
          description:
            "Permite ao cliente submeter uma avaliação (com comentário e imagem) para uma encomenda, mas apenas quando o status for 'delivered'.",
          parameters: [
            {
              name: "orderId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID da encomenda que será avaliada",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    rating: { type: "integer", minimum: 1, maximum: 5 },
                    comment: { type: "string" },
                    photo: { type: "string", format: "binary" },
                  },
                  required: ["rating", "comment"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "Avaliação submetida com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      review: {
                        type: "object",
                        properties: {
                          rating: { type: "integer" },
                          comment: { type: "string" },
                          photo: { type: "string" },
                          createdAt: { type: "string", format: "date-time" },
                        },
                      },
                    },
                  },
                  example: {
                    message: "Review submitted successfully.",
                    review: {
                      rating: 5,
                      comment: "Excelente serviço e comida deliciosa!",
                      photo: "uploads/review-photo.jpg",
                      createdAt: "2025-05-12T15:00:00.000Z",
                    },
                  },
                },
              },
            },
            400: { description: "Dados inválidos ou avaliação já submetida" },
            404: { description: "Encomenda não encontrada" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/orders/history": {
        get: {
          tags: ["Order"],
          summary: "Obter o histórico de encomendas de um cliente",
          description:
            "Retorna todas as encomendas de um cliente com status 'delivered' ou 'cancelled'.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Histórico de encomendas obtido com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      orders: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            status: { type: "string" },
                            createdAt: { type: "string", format: "date-time" },
                            restaurant: {
                              type: "object",
                              properties: {
                                _id: { type: "string" },
                                name: { type: "string" },
                              },
                            },
                            totalPrice: { type: "number" },
                          },
                        },
                      },
                    },
                  },
                  example: {
                    orders: [
                      {
                        _id: "12345",
                        status: "delivered",
                        createdAt: "2025-05-12T14:23:00.000Z",
                        restaurant: { _id: "98765", name: "Maré Viva" },
                        totalPrice: 19,
                      },
                      {
                        _id: "12346",
                        status: "cancelled",
                        createdAt: "2025-05-11T14:30:00.000Z",
                        restaurant: { _id: "98765", name: "Sabores do Porto" },
                        totalPrice: 24.5,
                      },
                    ],
                  },
                },
              },
            },
            400: { description: "Não autorizado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/menuItems/createMenuItem": {
        post: {
          tags: ["MenuItem"],
          summary: "Criar um novo menu item",
          description:
            "Cria um novo menu item para um restaurante. O item inclui nome, descrição, categoria, informações nutricionais e porções.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Sardinhas Assadas" },
                    description: {
                      type: "string",
                      example: "Sardinhas grelhadas na brasa com batata cozida",
                    },
                    category: {
                      type: "string",
                      example: "67f91302b4e0d271e8cab780",
                    },
                    calories: { type: "number", example: 420 },
                    fats: { type: "number", example: 24 },
                    proteins: { type: "number", example: 28 },
                    carbs: { type: "number", example: 20 },
                    portionName: {
                      type: "string",
                      example: "Dose Tradicional",
                    },
                    portionPrice: { type: "number", example: 9.5 },
                    images: {
                      type: "array",
                      items: { type: "string", format: "binary" },
                    },
                  },
                  required: [
                    "name",
                    "description",
                    "category",
                    "calories",
                    "fats",
                    "proteins",
                    "carbs",
                    "portionName",
                    "portionPrice",
                  ],
                },
              },
            },
          },
          responses: {
            200: {
              description: "Menu item criado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      menuItem: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          name: { type: "string" },
                          description: { type: "string" },
                          category: { type: "string" },
                          nutritionalInfo: {
                            type: "object",
                            properties: {
                              calories: { type: "number" },
                              proteins: { type: "number" },
                              carbs: { type: "number" },
                              fats: { type: "number" },
                            },
                          },
                          portions: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                name: { type: "string" },
                                price: { type: "number" },
                              },
                            },
                          },
                          images: { type: "array", items: { type: "string" } },
                        },
                      },
                    },
                  },
                  example: {
                    message: "Your menu was created successfully!",
                    menuItem: {
                      _id: "123456",
                      name: "Sardinhas Assadas",
                      description:
                        "Sardinhas grelhadas na brasa com batata cozida",
                      category: "67f91302b4e0d271e8cab780",
                      nutritionalInfo: {
                        calories: 420,
                        proteins: 28,
                        carbs: 20,
                        fats: 24,
                      },
                      portions: [
                        {
                          name: "Dose Tradicional",
                          price: 9.5,
                        },
                      ],
                      images: ["uploads/sardinhas.jpg"],
                    },
                  },
                },
              },
            },
            400: { description: "Campos obrigatórios ausentes" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/menuItems/updateMenuItem/{id}": {
        put: {
          tags: ["MenuItem"],
          summary: "Atualizar um menu item",
          description:
            "Atualiza um menu item existente, permitindo modificar o nome, descrição, categoria, informações nutricionais e porções.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID do menu item a ser atualizado",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Sardinhas Grelhadas" },
                    description: {
                      type: "string",
                      example: "Sardinhas grelhadas com arroz",
                    },
                    category: {
                      type: "string",
                      example: "67f91302b4e0d271e8cab780",
                    },
                    calories: { type: "number", example: 450 },
                    fats: { type: "number", example: 25 },
                    proteins: { type: "number", example: 30 },
                    carbs: { type: "number", example: 22 },
                    portionName: { type: "string", example: "Dose Familiar" },
                    portionPrice: { type: "number", example: 16 },
                    images: {
                      type: "array",
                      items: { type: "string", format: "binary" },
                    },
                  },
                  required: [
                    "name",
                    "description",
                    "category",
                    "calories",
                    "fats",
                    "proteins",
                    "carbs",
                    "portionName",
                    "portionPrice",
                  ],
                },
              },
            },
          },
          responses: {
            200: {
              description: "Menu item atualizado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      menuItemId: { type: "string" },
                    },
                  },
                  example: {
                    message: "MenuItem updated successfully",
                    menuItemId: "123456",
                  },
                },
              },
            },
            400: { description: "Campos inválidos" },
            404: { description: "Menu item não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/menuItems/deleteMenuItem/{id}": {
        delete: {
          tags: ["MenuItem"],
          summary: "Excluir um menu item",
          description: "Exclui um menu item existente de um restaurante.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID do menu item a ser excluído",
            },
          ],
          responses: {
            200: {
              description: "Menu item excluído com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                    },
                  },
                  example: {
                    message:
                      "MenuItem deleted successfully and removed from all menus",
                  },
                },
              },
            },
            400: { description: "ID inválido" },
            404: { description: "Menu item não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/menuItems/{menuItemId}/addPortion": {
        post: {
          tags: ["MenuItem"],
          summary: "Adicionar uma porção a um menu item",
          description:
            "Adiciona uma nova porção a um menu item, com um nome e preço.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "menuItemId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID do menu item ao qual será adicionada a porção",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    portionName: { type: "string", example: "Dose Familiar" },
                    portionPrice: { type: "number", example: 16 },
                  },
                  required: ["portionName", "portionPrice"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "Porção adicionada com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      menuItemId: { type: "string" },
                    },
                  },
                  example: {
                    message: "Portion was created successfully!",
                    menuItemId: "123456",
                  },
                },
              },
            },
            400: { description: "Campos ausentes ou inválidos" },
            404: { description: "Menu item não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/menuItems/{menuItemId}/removePortion/{portionId}": {
        delete: {
          tags: ["MenuItem"],
          summary: "Remover uma porção de um menu item",
          description: "Remove uma porção de um menu item existente.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "menuItemId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID do menu item",
            },
            {
              name: "portionId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID da porção a ser removida",
            },
          ],
          responses: {
            200: {
              description: "Porção removida com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                    },
                  },
                  example: {
                    message: "Portion removed successfully",
                  },
                },
              },
            },
            400: { description: "ID inválido" },
            404: { description: "Porção ou menu item não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/menuItems/restaurant/{restaurantId}": {
        get: {
          tags: ["MenuItem"],
          summary: "Obter todos os menu items de um restaurante",
          description:
            "Retorna todos os menu items de um restaurante específico.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "restaurantId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID do restaurante",
            },
          ],
          responses: {
            200: {
              description: "Menu items do restaurante obtidos com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      menuItems: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            name: { type: "string" },
                            description: { type: "string" },
                            category: { type: "string" },
                            nutritionalInfo: {
                              type: "object",
                              properties: {
                                calories: { type: "number" },
                                proteins: { type: "number" },
                                carbs: { type: "number" },
                                fats: { type: "number" },
                              },
                            },
                            portions: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  name: { type: "string" },
                                  price: { type: "number" },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  example: {
                    menuItems: [
                      {
                        _id: "12345",
                        name: "Sardinhas Assadas",
                        description: "Sardinhas grelhadas com batata",
                        category: "67f91302b4e0d271e8cab780",
                        nutritionalInfo: {
                          calories: 420,
                          proteins: 28,
                          carbs: 20,
                          fats: 24,
                        },
                        portions: [
                          {
                            name: "Dose Tradicional",
                            price: 9.5,
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            },
            400: { description: "ID inválido" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/menuItems/myMenuItems": {
        get: {
          tags: ["MenuItem"],
          summary: "Obter todos os menu items do utilizador restaurante",
          description:
            "Retorna todos os menu items associados ao restaurante do usuário autenticado.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Menu items do restaurante obtidos com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      menuItems: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            name: { type: "string" },
                            description: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                  example: {
                    menuItems: [
                      {
                        _id: "12345",
                        name: "Sardinhas Assadas",
                        description: "Sardinhas grelhadas na brasa",
                      },
                    ],
                  },
                },
              },
            },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/menuItems/menuItem/{id}": {
        get: {
          tags: ["MenuItem"],
          summary: "Obter um menu item por ID",
          description:
            "Retorna um menu item específico, com detalhes completos.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID do menu item",
            },
          ],
          responses: {
            200: {
              description: "Menu item obtido com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      _id: { type: "string" },
                      name: { type: "string" },
                      description: { type: "string" },
                      category: { type: "string" },
                      nutritionalInfo: {
                        type: "object",
                        properties: {
                          calories: { type: "number" },
                          proteins: { type: "number" },
                          carbs: { type: "number" },
                          fats: { type: "number" },
                        },
                      },
                      portions: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            price: { type: "number" },
                          },
                        },
                      },
                      images: { type: "array", items: { type: "string" } },
                    },
                  },
                  example: {
                    _id: "12345",
                    name: "Sardinhas Assadas",
                    description: "Sardinhas grelhadas com batata cozida",
                    category: "67f91302b4e0d271e8cab780",
                    nutritionalInfo: {
                      calories: 420,
                      proteins: 28,
                      carbs: 20,
                      fats: 24,
                    },
                    portions: [
                      {
                        name: "Dose Tradicional",
                        price: 9.5,
                      },
                    ],
                    images: ["uploads/sardinhas.jpg"],
                  },
                },
              },
            },
            400: { description: "ID inválido" },
            404: { description: "Menu item não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/menus/createMenu": {
        post: {
          tags: ["Menu"],
          summary: "Criar um novo menu",
          description:
            "Cria um novo menu para um restaurante, incluindo nome, descrição e imagem.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Menu Executivo" },
                    description: {
                      type: "string",
                      example: "Menu com opções variadas para almoço.",
                    },
                    image: { type: "string", format: "binary" },
                  },
                  required: ["name", "description", "image"],
                },
              },
            },
          },
          responses: {
            201: {
              description: "Menu criado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      menu: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          name: { type: "string" },
                          description: { type: "string" },
                          image: { type: "string" },
                        },
                      },
                    },
                  },
                  example: {
                    message: "Menu created successfully",
                    menu: {
                      _id: "123456",
                      name: "Menu Executivo",
                      description: "Menu com opções variadas para almoço.",
                      image: "uploads/menu_executivo.jpg",
                    },
                  },
                },
              },
            },
            400: { description: "Campos obrigatórios ausentes" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/menus/updateMenu/{id}": {
        put: {
          tags: ["Menu"],
          summary: "Atualizar um menu existente",
          description:
            "Atualiza o nome, descrição e imagem de um menu existente.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID do menu a ser atualizado",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Menu Gourmet" },
                    description: {
                      type: "string",
                      example: "Menu com pratos gourmet e vinhos exclusivos.",
                    },
                    image: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Menu atualizado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      menu: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          name: { type: "string" },
                          description: { type: "string" },
                          image: { type: "string" },
                        },
                      },
                    },
                  },
                  example: {
                    message: "Menu updated successfully",
                    menu: {
                      _id: "123456",
                      name: "Menu Gourmet",
                      description:
                        "Menu com pratos gourmet e vinhos exclusivos.",
                      image: "uploads/menu_gourmet.jpg",
                    },
                  },
                },
              },
            },
            400: { description: "Campos inválidos ou ID não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/menus/deleteMenu/{id}": {
        delete: {
          tags: ["Menu"],
          summary: "Excluir um menu",
          description: "Exclui um menu existente de um restaurante.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID do menu a ser excluído",
            },
          ],
          responses: {
            200: {
              description: "Menu excluído com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                    },
                  },
                  example: {
                    message: "Menu deleted successfully",
                  },
                },
              },
            },
            400: { description: "ID inválido" },
            404: { description: "Menu não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/menus/{menuId}/addItem": {
        post: {
          tags: ["Menu"],
          summary: "Adicionar item a um menu",
          description: "Adiciona um menu item a um menu existente.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "menuId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID do menu ao qual o item será adicionado",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    menuItemId: { type: "string", example: "56789" },
                  },
                  required: ["menuItemId"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "Item adicionado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      menuId: { type: "string" },
                      menuItemId: { type: "string" },
                    },
                  },
                  example: {
                    message: "Menu item added successfully",
                    menuId: "123456",
                    menuItemId: "56789",
                  },
                },
              },
            },
            400: { description: "Menu item inválido ou já adicionado" },
            404: { description: "Menu ou menu item não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/menus/{menuId}/removeItem/{itemId}": {
        delete: {
          tags: ["Menu"],
          summary: "Remover item de um menu",
          description: "Remove um menu item específico de um menu.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "menuId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID do menu",
            },
            {
              name: "itemId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID do menu item a ser removido",
            },
          ],
          responses: {
            200: {
              description: "Item removido com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                    },
                  },
                  example: {
                    message: "Menu item removed successfully",
                  },
                },
              },
            },
            400: { description: "ID inválido ou item não encontrado" },
            404: { description: "Menu ou menu item não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/menus/myMenus": {
        get: {
          tags: ["Menu"],
          summary: "Obter os menus do user restaurante",
          description:
            "Retorna todos os menus associados ao restaurante do usuário autenticado.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Menus obtidos com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      menus: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            name: { type: "string" },
                            description: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                  example: {
                    menus: [
                      {
                        _id: "123456",
                        name: "Menu Executivo",
                        description: "Menu com opções variadas para almoço.",
                      },
                    ],
                  },
                },
              },
            },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/menus/menu/{id}": {
        get: {
          tags: ["Menu"],
          summary: "Obter um menu por ID",
          description:
            "Retorna um menu específico por ID, incluindo itens e detalhes completos.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID do menu",
            },
          ],
          responses: {
            200: {
              description: "Menu obtido com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      _id: { type: "string" },
                      name: { type: "string" },
                      description: { type: "string" },
                      menuItems: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            name: { type: "string" },
                            description: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                  example: {
                    _id: "123456",
                    name: "Menu Executivo",
                    description: "Menu com opções variadas para almoço.",
                    menuItems: [
                      {
                        _id: "7890",
                        name: "Sardinhas Assadas",
                        description: "Sardinhas grelhadas com batata cozida",
                      },
                    ],
                  },
                },
              },
            },
            400: { description: "ID inválido" },
            404: { description: "Menu não encontrado" },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/menus/searchMenuItems": {
        get: {
          tags: ["Menu"],
          summary: "Pesquisar menu items",
          description:
            "Permite pesquisar menu items com base em filtros como categoria, preço e restaurante.",
          parameters: [
            {
              name: "category",
              in: "query",
              required: false,
              schema: { type: "string" },
            },
            {
              name: "minPrice",
              in: "query",
              required: false,
              schema: { type: "number" },
            },
            {
              name: "maxPrice",
              in: "query",
              required: false,
              schema: { type: "number" },
            },
            {
              name: "restaurant",
              in: "query",
              required: false,
              schema: { type: "string" },
            },
            {
              name: "location",
              in: "query",
              required: false,
              schema: { type: "string" },
            },
            {
              name: "name",
              in: "query",
              required: false,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Itens de menu encontrados com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      menuItems: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            name: { type: "string" },
                            description: { type: "string" },
                          },
                        },
                      },
                      count: { type: "number" },
                    },
                  },
                  example: {
                    menuItems: [
                      {
                        _id: "7890",
                        name: "Sardinhas Assadas",
                        description: "Sardinhas grelhadas com batata cozida",
                      },
                    ],
                    count: 1,
                  },
                },
              },
            },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
      "/menus/filters": {
        get: {
          tags: ["Menu"],
          summary: "Obter filtros para pesquisa de itens de menu",
          description:
            "Retorna os filtros disponíveis para categorias e restaurantes, úteis para pesquisa de itens de menu.",
          responses: {
            200: {
              description: "Filtros obtidos com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      categories: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            name: { type: "string" },
                          },
                        },
                      },
                      restaurants: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            name: { type: "string" },
                            address: {
                              type: "object",
                              properties: {
                                street: { type: "string" },
                                city: { type: "string" },
                                postalCode: { type: "string" },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  example: {
                    categories: [
                      {
                        _id: "67f91302b4e0d271e8cab780",
                        name: "Meat",
                      },
                      {
                        _id: "67f91307b4e0d271e8cab78b",
                        name: "Fish",
                      },
                    ],
                    restaurants: [
                      {
                        _id: "681b8a7dca96f65e81408d5d",
                        name: "Maré Viva",
                        address: {
                          street: "Avenida Marginal, 120",
                          city: "Cascais",
                          postalCode: "2750-427",
                        },
                      },
                      {
                        _id: "681b94b37b83b70728b5c3b2",
                        name: "Sabores da Margem",
                        address: {
                          street: "Cais da Ribeira, 42",
                          city: "Porto",
                          postalCode: "4050-510",
                        },
                      },
                    ],
                  },
                },
              },
            },
            500: { description: "Erro interno do servidor" },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);
module.exports = specs;
