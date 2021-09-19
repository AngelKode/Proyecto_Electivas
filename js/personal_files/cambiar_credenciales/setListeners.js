
const changePasswd = (oldPasswd,newPasswd) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method : 'POST',
            url    : './php/admin/change_passwd.php',
            data   : {
                oldPasswd : oldPasswd,
                newPasswd : newPasswd
            },
            success : (serverResponse) => {
                
                const jsonResponse = JSON.parse(serverResponse)
                const {status} = jsonResponse

                if(status !== 'success'){
                    reject(jsonResponse)
                }else{
                    resolve(jsonResponse)
                }
            }
        })
    })
}

$(document).ready(() => {

    const oldPasswdInput = document.getElementById("oldPasswd")
    const newPasswdInput = document.getElementById("newPasswd")
    const newPasswdCheckInput = document.getElementById("newPasswdCheck")

    oldPasswdInput.addEventListener('keyup', (event) => {
        if(oldPasswdInput.value.trim() !== "" && newPasswdInput.value.trim() !== "" && newPasswdCheckInput.value.trim() !== ""){
            $("#changePasswdBtn").prop("disabled",false)
        }else{
            $("#changePasswdBtn").prop("disabled",true)
        }
    })

    newPasswdInput.addEventListener('keyup', (event) => {
        //Checamos si están todos los inputs llenados
        if(oldPasswdInput.value.trim() !== "" && newPasswdInput.value.trim() !== "" && newPasswdCheckInput.value.trim() !== ""){
            //Checamos si son iguales
            if(newPasswdInput.value.trim() === newPasswdCheckInput.value.trim()){
                $("#changePasswdBtn").prop("disabled",false)
            }else{
                $("#changePasswdBtn").prop("disabled",true)
            }
        }else{
            $("#changePasswdBtn").prop("disabled",true)
        }
    })

    newPasswdCheckInput.addEventListener('keyup', (event) => {
        //Checamos si están todos los inputs llenados
        if(oldPasswdInput.value.trim() !== "" && newPasswdInput.value.trim() !== "" && newPasswdCheckInput.value.trim() !== ""){
            //Checamos si está igual a la contraseña anterior
            if(newPasswdInput.value.trim() === newPasswdCheckInput.value.trim()){
                $("#changePasswdBtn").prop("disabled",false)
            }else{
                $("#changePasswdBtn").prop("disabled",true)
            }
        }else{
            $("#changePasswdBtn").prop("disabled",true)
        }
    })

    const btnChangePasswd = document.getElementById("changePasswdBtn")

    btnChangePasswd.addEventListener('click', (event) => {
        swal({
            title: "Cambiando contraseña",
            text: "Espere un momento por favor...",
            type: "info",
            showConfirmButton : false
        });

        changePasswd(oldPasswdInput.value.trim(),newPasswdInput.value.trim())
        .then(({message,status}) => {
            swal({
                title: "Actualización correcta",
                text: message,
                type: status,
                showConfirmButton : false,
                timer : 2000
            });
            oldPasswdInput.value = "";
            newPasswdInput.value = "";
            newPasswdCheckInput.value = "";
        })
        .catch(({message,status}) => {
            swal({
                title: "Error",
                text: message,
                type: 'warning',
                showConfirmButton : false,
                timer : 2000
            });
        })
    })
})