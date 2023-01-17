<?php 
    require "./admin-protection/protection.php";
    require "./config/config.php";

    $protection = md5('semur');

    if(isset($_POST['cat-name-arm']) && isset($_POST['cat-name-ru']) && isset($_POST['cat-name-eng']) && isset($_POST['infoarm'])
    && isset($_POST['inforu']) && isset($_POST['infoeng'])){
        $catarm = $_POST['cat-name-arm'];
        $catru = $_POST['cat-name-ru'];
        $cateng = $_POST['cat-name-eng'];
        $infoarm = $_POST['infoarm'];
        $inforu = $_POST['inforu'];
        $infoeng = $_POST['infoeng'];

        if(!empty($_FILES['file'])){
        
            $file = $_FILES['file'];
            $name = $file['name'];
            $pathFile = __DIR__.'/img-blog/'.$name;
            if(!move_uploaded_file($file['tmp_name'], $pathFile)){
                echo 'Տվյալ Ֆայլը չեք կարող ներբեռնել!';
            }

            $mysql -> query("INSERT INTO `blogs`(`namearm`,`nameru`,`nameeng`,`img`,`descriptionarm`,`descriptionru`,`descriptioneng`)
            VALUES ('$catarm','$catru','$cateng','$name','$infoarm','$inforu','$infoeng')");

            header('location: Add-blog.php?h='.$protection.'');
        }else{
            header('location: Add-blog.php?h='.$protection.'');

        }


    }else{
        header('location: Add-blog.php?h='.$protection.'');

    }