const mongoose = require("mongoose");

async function connectToDb(URL) {
    try {
        // Connect to MongoDB with the writeConcern option
        await mongoose.connect(URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            writeConcern: { w: 'majority' },  // Set write concern globally for this connection
        });

        console.log('Connection is successful');
    } catch (error) {
        console.error('Connection failed:', error.message);
    }
}

module.exports = {
    connectToDb
};
