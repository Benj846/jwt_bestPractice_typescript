import "reflect-metadata";
import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import UserResolver from "./UserResolver";
import { User } from "./entity/User";
import { createConnection } from "typeorm";
import cors from 'cors'
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { verify } from "jsonwebtoken";
import { createAccessToken, createRefreshToken } from "./auth";
import {sendRefreshToken} from './sendRefreshToken'
// createConnection().then(async connection => {

//     console.log("Inserting a new user into the database...");
//     const user = new User();
//     user.firstName = "Timber";
//     user.lastName = "Saw";
//     user.age = 25;
//     await connection.manager.save(user);
//     console.log("Saved a new user with id: " + user.id);

//     console.log("Loading users from the database...");
//     const users = await connection.manager.find(User);
//     console.log("Loaded users: ", users);

//     console.log("Here you can setup and run express/koa/any other framework.");

// }).catch(error => console.log(error));

(async () => {
  const app = express();
  // setup cors manually
  app.use(cors({
    origin:'http://localhost:3000',
    credentials:true
  }));
  app.use(cookieParser());
  app.get("/", (_req, res) => res.send("say hello"));
  app.post("/refresh_token", async (req, res) => {
    const token = req.cookies.jid;
    if (!token) {
      return res.send({ ok: false, accessToken: "" });
    }
    let payload: any = null;
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (error) {
      console.log(error);
      return res.send({ ok: false, accessToken: "" });
    }
    // token is valid and we can send back an access token
    const user = await User.findOne({ id: payload.userId });

    if (!user) {
      return res.send({ ok: false, accessToken: "" });
    }
    if(user.tokenVersion!== payload.tokenVersion){
      return res.send({ok:false, accessToken:''})
    }
    sendRefreshToken(res,createRefreshToken(user))
    return res.send({ ok: true, accessToken: createAccessToken(user) });
  });

  await createConnection();
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
    }),
    context: ({ req, res }) => ({ req, res }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    //disable cors that's default in apolloServer
    cors: false,
    // cors: { credentials: true, origin: "http://localhost:4000" },
  });
  app.listen(4000, () => {
    console.log("express server started");
  });
})();
