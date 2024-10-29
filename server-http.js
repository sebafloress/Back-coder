import http from 'node:http';

const server = http.createServer ((req,res)=>{
    res.end('hola mundo')
})

server.listen(8080,()=>console.log('server ok en el puerto 8080'))