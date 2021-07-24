export function showNotification({message = "", type = "info", element = "body", offset = {x : 30,y : 75},placement = {from : "top", align : "right"}}){
    () => {
        notify = $.notify({
            message: message
        },{
            type: type,
            allow_dismiss: false,
            newest_on_top: true,
            element : element,
            placement: placement,
            delay: 3000,
            timer: 1000,
            offset : offset,
            animate: {
                enter: 'animated fadeInDown',
                exit: 'animated fadeOutUp'
            },
            template : `<div data-notify="container" class="alert alert-{0}" role="alert">
                            <span data-notify="message">{2}</span>
                        </div>`
        });
    }
}