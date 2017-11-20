
module.exports = {
    init:function(io){
        io.on('connection', function(socket){
            console.log('a user connected');
            socket.on('disconnect',function(){

            })
        });
    }
}