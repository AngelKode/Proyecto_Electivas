
const formatos = {
    email : /^[\w.+-]+@[a-zA-Z\d-]+\.[a-zA-Z\d-.]+$/, 
    /**
    *? /^[\w.+-]+
        evalua lo que va antes del @ y lo que va al principio de la cadena, 
        pudiendo ser letras minusculas, mayusculas, numeros, guion bajo(_) o cualquier
        otro caracter menos nueva linea, espacio,etc y eso puede repetirse 1 o mas veces y al final un guion
        y todo esto 1 o más veces
    *? @[a-zA-Z\d-]+
        evalua que debej de llevar despues de la parte anterior, un @, y despues pueden ir minusculas, mayusculas,
        numeros y guiones, y todo eso 1 o mas veces
    *? \.[a-zA-Z\d-.]+$
        evaluamos que tenga un . al inicio, despues puede ir mayusculas, minusculas, números, guiones y al final
        cualquier caracter menos nueva linea, espacio,etc, esto 1 o mas veces, y con el simbolo $, indicamos el final 
        de la palabra
    */
    whatsapp : /^[\d]{3}[ ][\d]{3}[ ][\d]{4}$/
    /** 
     *? ^[\d]{3}[ ]
        Evalua que al inicio tengamos 3 números y luego un espacio
     *? [\d]{3}[ ]
        Despues evalua que sean otros 3 numeros y un espacio
     *? [\d]{4}$
        Y que al final del número, sean 4 digitos
    */,
    telefono : /^[\d]{2} [\d]{2} [\d]{2} [\d]{2} [\d]{2} Ext [\d]{5}$/
    /**
     *? ^[\d]{2} [\d]{2} [\d]{2} [\d]{2} [\d]{2} Ext 
        Evalua que haya 5 pares de digitos con un espacio entre ellos y al final contenga la palabra ' Ext '
     *? [\d]{5}$
        Evalua que los números de la extensión sean 5
     */
}

$(document).ready(() => {
    //Inicializamos los inputs
    new Cleave('#newContentWhatsApp', {
        delimiters: [' ',' '],
        blocks: [3,3,4],
    });
    new Cleave('#newContentTelefono', {
        delimiters: [' ',' ',' ', ' ',' Ext '],
        blocks: [2,2,2,2,2,5],
    });

    //Configuramos la evaluacion cuando se ingresan datos en los inputs de email, telefono y whatsapp
    $("#newContentEmail").keyup(function(){
        //Verificamos que el formato del email sea el correcto
        if($(this).val().trim().length < 1){
            $("#group-email").removeClass('error');
            $("#group-email").removeClass('success');
            $(".input-icon-correct-email").css("display","none")
            $(".input-icon-incorrect-email").css("display","none")
            $("#changeEmailBtn").prop("disabled", true)
        }else{
            if(formatos.email.test($(this).val())){
                $("#group-email").removeClass('error');
                $("#group-email").addClass('success');
                $(".input-icon-correct-email").css("display","block")
                $(".input-icon-incorrect-email").css("display","none")
                $("#changeEmailBtn").prop("disabled",false)
            }else{
                $("#group-email").addClass('error');
                $("#group-email").removeClass('success');
                $(".input-icon-incorrect-email").css("display","block")
                $(".input-icon-correct-email").css("display","none")
                $("#changeEmailBtn").prop("disabled",true)
            }
        }
    })

    $("#newContentWhatsApp").keyup(function(){
        //Verificamos que el formato del número sea el correcto
        if($(this).val().trim().length < 1){
            $("#group-whatsapp").removeClass('error');
            $("#group-whatsapp").removeClass('success');
            $(".input-icon-correct-whatsapp").css("display","none")
            $(".input-icon-incorrect-whatsapp").css("display","none")
            $("#changeWhatsAppBtn").prop("disabled", true)
        }else{
            if(formatos.whatsapp.test($(this).val().trim())){
                $("#group-whatsapp").removeClass('error');
                $("#group-whatsapp").addClass('success');
                $(".input-icon-correct-whatsapp").css("display","block")
                $(".input-icon-incorrect-whatsapp").css("display","none")
                $("#changeWhatsAppBtn").prop("disabled",false)
            }else{
                $("#group-whatsapp").addClass('error');
                $("#group-whatsapp").removeClass('success');
                $(".input-icon-incorrect-whatsapp").css("display","block")
                $(".input-icon-correct-whatsapp").css("display","none")
                $("#changeWhatsAppBtn").prop("disabled",true)
            }
        }
    })

    $("#newContentTelefono").keyup(function(){
        //Verificamos que el formato del número sea el correcto
        if($(this).val().trim().length < 1){
            $("#group-telefono").removeClass('error');
            $("#group-telefono").removeClass('success');
            $(".input-icon-correct-telefono").css("display","none")
            $(".input-icon-incorrect-telefono").css("display","none")
            $("#changeNumberBtn").prop("disabled", true)
        }else{
            if(formatos.telefono.test($(this).val().trim())){
                $("#group-telefono").removeClass('error');
                $("#group-telefono").addClass('success');
                $(".input-icon-correct-telefono").css("display","block")
                $(".input-icon-incorrect-telefono").css("display","none")
                $("#changeNumberBtn").prop("disabled",false)
            }else{
                $("#group-telefono").addClass('error');
                $("#group-telefono").removeClass('success');
                $(".input-icon-incorrect-telefono").css("display","block")
                $(".input-icon-correct-telefono").css("display","none")
                $("#changeNumberBtn").prop("disabled",true)
            }
        }
    })
})