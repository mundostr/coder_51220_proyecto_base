const socket = io('ws://localhost:3000');

let user;
const chatBox = document.getElementById('chatBox');
const messagesLog = document.getElementById('messagesLog');

chatBox.addEventListener('keyup', (event) => {
    if (event.key === 'Enter' && chatBox.value.trim().length > 0) {
        socket.emit('new_message', { user: user, msg: chatBox.value });
    }
});

socket.on('connect', () => { // Escuchamos el evento connect para detectar cuándo logramos conectar al servidor
    // Escuchamos por el evento server_confirm desde el servidor
    socket.on('server_confirm', (data) => {
        console.log("El servidor ha confirmado la conexión");
        console.log(data);
    });

    socket.on('msg_received', (data) => {
        messagesLog.innerHTML = `${messagesLog.innerHTML}<br>(${data.user}) ${data.msg}`;
    });

    // Este evento llega desde el endpoint POST /users
    socket.on('new_user', (data) => {
        console.log(data);
    });
})

// Sweetalert
const swalConfig = {
    title: 'Identificación',
    text: 'Indique usuario:',
    input: 'text',
    inputValidator: (val) => {
        return !val && 'Por favor especificar usuario';
    },
    allowOutsideClick: false
};

Swal.fire(swalConfig).then((res) => {
    user = res.value;
});