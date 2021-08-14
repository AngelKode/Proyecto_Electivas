<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    function getJSONData($dataToConvert){
        $dataResult = array();

        foreach($dataToConvert as $dataValue){
            $dataNew = array();
            foreach($dataValue as $valueKey => $valueData){
                $dataNew[$valueKey] = $valueData;
            }
            array_push($dataResult, $dataNew);
        }

        return $dataResult;
    }

    $serverResponse = array();

    if(isset($_POST['newRegistrosElectivasLiberadas']) && isset($_POST['IDConstanciaToDelete'])){
        //Convertimos lo que se manda, a un objeto
        $dataSentToArray = getJSONData(json_decode($_POST['newRegistrosElectivasLiberadas']));
        
        //En caso de que la constancia a eliminar sea 0, lo eliminamos antes de hacer las demas comparaciones
        if(intval($_POST['IDConstanciaToDelete']) != 0){
            $mysql_request_delete_registers = "DELETE FROM `constancia_electiva` WHERE `Constancia_id` = '".intval($_POST['IDConstanciaToDelete'])."';";
            $mysql_response = mysqli_query($link, $mysql_request_delete_registers);
        }

        //Recorremos lo que se mandó, para hacer las actualizaciones en los registros
        foreach($dataSentToArray as $newRowConstanciaValidada){

            //Primero obtenemos cuantos registros hay con la ID de cada constancia del alumno que ya se validó
            $ID_Constancia = $newRowConstanciaValidada['ID_Constancia'];
            $mysql_request_past_registers = "SELECT * FROM `constancia_electiva` WHERE `Constancia_id` = '".intval($ID_Constancia)."';";
            $mysql_response = mysqli_query($link, $mysql_request_past_registers);

            //Si hay registros, los actualizamos
            if($mysql_response){
                //Obtenemos los registros que arrojó la peticion
                $oldDataElectivas = array();
                while($row = mysqli_fetch_array($mysql_response)){
                    array_push($oldDataElectivas, $row['ID']);
                }

                //Recorremos todos los registros que ya se habian creado anteriormente con el ID de la constancia
                $counterPosicionArray = 0;
                //Obtenemos el array asociativo de los creditos nuevos
                $arrayCreditos = json_decode(json_encode($newRowConstanciaValidada['Creditos']),true);

                //Recorremos los registros con un mismo ID de constancia, en la tabla de las constancias ya validadas anteriormente
                foreach($oldDataElectivas as $data){

                    //Obtenemos los nuevos datos de la constancia en la posicion 'counterPosicionArray'
                    $newData = $arrayCreditos[intval($counterPosicionArray)];

                    //Actualizamos el registro actual con la posicion en la que vamos, ya sea para actualizarla o eliminarla
                    $mysql_request_update_register = "";

                    //Si los creditos que se van a actualizar, son iguales a 0, eliminamos ese registro; si no, actualizamos a los nuevos datos
                    if(floatval($arrayCreditos[intval($counterPosicionArray)]['Creditos']) == 0){
                        $mysql_request_update_register = "DELETE FROM `constancia_electiva` WHERE ID = '".intval($data)."';";
                    }else{
                        $mysql_request_update_register = "UPDATE `constancia_electiva` SET `Electiva_id` = '".intval($newData['IDElectiva'])."', `Constancia_id` = '".intval($ID_Constancia)."', `Creditos` = '".floatval($newData['Creditos'])."' WHERE ID = '".intval($data)."';";
                    }

                    //Hacemos la peticion
                    $mysql_response = mysqli_query($link, $mysql_request_update_register);

                    if(!$mysql_response){
                        break;
                    }

                    //Aumentamos en 1 la posicion
                    $counterPosicionArray++;
                }

               //Recorremos los créditos que se le asignan a cada electiva de la constancia actual, desde la posicion donde se quedó iteración anterior
                for($indiceArray = $counterPosicionArray; $indiceArray < count($arrayCreditos);$indiceArray++){

                    //Obtenemos los créditos que se van a actualizar de la constancia actual
                    $Creditos = $arrayCreditos[intval($indiceArray)]['Creditos'];

                    //Si los creditos son mayores a 0, creamos el registro.
                    if(floatval($Creditos) > 0){

                        //Obtenemos el ID de la electiva a la que hace referencia los créditos
                        $ID_Electiva = $arrayCreditos[intval($indiceArray)]['IDElectiva'];

                        //Creamos los nuevos registros
                        $mysql_add_register = "INSERT INTO `constancia_electiva` (`Electiva_id`, `Constancia_id`, `Creditos`) VALUES ('".intval($ID_Electiva)."','".intval($ID_Constancia)."','".floatval($Creditos)."');";
                        $mysql_response = mysqli_query($link, $mysql_add_register);

                        if(!$mysql_response){
                            break;
                        }
                    }
                } 

                $serverResponse['status'] = 'success';
            }else{
                //Si no, se crean 
                $serverResponse['status'] = 'danger';
                $serverResponse['message'] = 'Error de la base de datos. Inténtelo nuevamente.';
            }
        }

    }else{
        $serverResponse['status'] = 'danger';
        $serverResponse['message'] = 'Error del servidor. Inténtelo nuevamente';
    }

    //Mandamos la respuesta del servidor
    echo json_encode($serverResponse);


    //Nos desconectamos de la BD
    mysqli_close($link);
?>