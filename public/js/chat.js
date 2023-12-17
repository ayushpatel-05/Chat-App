const socket = io();
// const btn = document.getElementById('increment');

// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated', count);
// })
// btn.addEventListener('click', () => {
//     console.log('Clicked');
//     socket.emit('increment');
// })
const frm = document.getElementById('message-form');
const frmInput = frm.querySelector('input');
const frmButton = frm.querySelector('button');
const locationBtn = document.getElementById('send-location');
const messages = document.getElementById('messages');


//Templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationMessageTemplate = document.getElementById('location-message-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;
// console.log(frm);

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix : true});


frm.addEventListener('submit', (event) => {
    event.preventDefault();
    // frmButton.setAttribute('disabled',true);
    frmButton.disabled = true;
    // const message = document.querySelector('input').value;
    const message = event.target.elements.message.value;
    // event.target.elements.message.value = '';
    
    socket.emit('sendMessage', message, (error) => {
        frmButton.disabled = false;
        frmInput.value = '';
        frmInput.focus();
        if(error) {
            return console.log(error);
        }
        // console.log('Message Delivered');
    });
})


locationBtn.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.');
    }
    locationBtn.disabled = true;
    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude,
        }
        socket.emit('sendLocation', location, () => {
            locationBtn.disabled = false;
            // console.log('Location Shared!');
        });
    })
})


const autoScroll = () => {
    const newMessage = messages.lastElementChild;
    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;
    // console.log(newMessageStyles.height);

    const visibleHeight = messages.offsetHeight;
    const containerHeight = messages.scrollHeight;
    const scrollOffset = messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight;
    }
}


socket.on('message', (message) => {
    // console.log(message);
    // console.log(message.username);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        createdAt: moment(message.createdAt).format('h:mm a'),
        message: message.text
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('locationMessage', (obj) => {
    const html = Mustache.render(locationMessageTemplate, {
        username: obj.username,
        url: obj.url,
        createdAt: moment(obj.createdAt).format('h:mm a')
    });
    // console.log(html);
    messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
    // console.log(message);
});

socket.on('roomData', ({ room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.getElementById('sidebar').innerHTML = html;
});


socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error);
        location.href = '/';
    }
});