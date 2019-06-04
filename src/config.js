const secret = 'lflekfmsldkjlaskfjlkfjalsjfdaslkdjfasnmnbhb';
module.exports = {
    MongoDb_Url : process.env.MONGO_URL || "mongodb://fakhrad:logrezaee24359@ds135036.mlab.com:35036/content-db",
    secret : process.env.JWT_SECRET || secret
};