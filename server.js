const express=require('express');
const cors=require('cors');
const morgan=require('morgan');
const cookieParser=require('cookie-parser');

const {connectToPostgresDB}=require('./src/database/postgresqlDB');
const {connectToMongoDB}=require('./src/database/mongoDB');
const connectToCloudinaryDB=require('./src/database/cloudinaryDB');

const userRoutes=require('./src/routes/userRoutes');

const app=express();

const SERVER_PORT=process.env.SERVER_PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
// app.use(express.urlencoded({extended:true}));

async function connectToDB(){
    try{
        await connectToPostgresDB();
        await connectToMongoDB();
        await connectToCloudinaryDB();
    }catch(error){
        console.error('Error connecting to databases');
        console.error(error);
        process.exit(1);
    }
}

connectToDB();

app.use('/api/auth/users', userRoutes);

app.get('/', (req, res)=>{
    res.send('Hello World');
});

app.listen(SERVER_PORT, ()=>{    
    console.log(`Server running on port ${SERVER_PORT}`);
});