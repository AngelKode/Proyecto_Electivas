export default function showNotification({message = "", type = "info", element = "body", offset = {x : 30,y : 75},placement = {from : "top", align : "right"}, position = "absolute", custom_width = "", icon = "info"}){
    return () => {
        $.notify({
            message: message,
            icon: `glyphicon glyphicon-${icon}-sign`,
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
            position : position,
            template : `<div data-notify="container" class="alert alert-{0}" role="alert" ${custom_width}>
                            <span data-notify="icon"></span>
                            <span data-notify="message">{2}</span>
                        </div>`
        });
    }
}