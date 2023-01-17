<?php 
    require "./admin-protection/protection.php";
    require "./config/config.php";

    $protection = md5('semur');

    if(isset($_POST['cat-name-arm']) && isset($_POST['cat-name-ru']) && isset($_POST['cat-name-eng']) && isset($_POST['hastutyun']) 
    && isset($_POST['laynutyun']) && isset($_POST['ogt_laynutyun']) && isset($_POST['erkarutyun']) && isset($_POST['infoarm']) 
    && isset($_POST['infoarm']) && isset($_POST['inforu']) && isset($_POST['infoeng']) && isset($_POST['cat-id']) && isset($_POST['colored'])){
            $cat_name_arm = $_POST['cat-name-arm'];
            $cat_name_ru = $_POST['cat-name-ru'];
            $cat_name_eng = $_POST['cat-name-eng'];
            $hastutyun = $_POST['hastutyun'];
            $laynutyun = $_POST['laynutyun'];
            $ogt_laynutyun = $_POST['ogt_laynutyun'];
            $erkarutyun = $_POST['erkarutyun'];
            $infoarm = $_POST['infoarm'];
            $inforu = $_POST['inforu'];
            $infoeng = $_POST['infoeng'];
            $catid = $_POST['cat-id'];
            $colored = $_POST['colored'];
            $inhomepage = $_POST['homepageitem'];
            if(!empty($_FILES['file1']) && !empty($_FILES['file2']) && !empty($_FILES['file3']) && !empty($_FILES['file4'])){
                $file1 = $_FILES['file1'];
                $file2 = $_FILES['file2'];
                $file3 = $_FILES['file3'];
                $file4 = $_FILES['file4'];
                $name1 = $file1['name'];
                $name2 = $file2['name'];
                $name3 = $file3['name'];
                $name4 = $file4['name'];
                $pathFile1 = __DIR__.'/img-items/'.$name1;
                $pathFile2 = __DIR__.'/img-items/'.$name2;
                $pathFile3 = __DIR__.'/img-items/'.$name3;
                $pathFile4 = __DIR__.'/img-items/'.$name4;
                if(!move_uploaded_file($file1['tmp_name'], $pathFile1)){
                    echo 'Տվյալ Ֆայլը չեք կարող ներբեռնել!';
                }
                if(!move_uploaded_file($file2['tmp_name'], $pathFile2)){
                    echo 'Տվյալ Ֆայլը չեք կարող ներբեռնել!';
                }
                if(!move_uploaded_file($file3['tmp_name'], $pathFile3)){
                    echo 'Տվյալ Ֆայլը չեք կարող ներբեռնել!';
                }
                if(!move_uploaded_file($file4['tmp_name'], $pathFile4)){
                    echo 'Տվյալ Ֆայլը չեք կարող ներբեռնել!';
                }


                    $mysql -> query("INSERT INTO `items` (`namearm`,`nameru`,`nameeng`,`ownimage`,`image2`,
                    `image3`,`image4`,`descriptionarm`,`descriptionru`,`descriptioneng`,`thickness`,
                    `width`,`useful_width`,`length`,`incategory`,`colored`,`inhomepage`) VALUES ('$cat_name_arm','$cat_name_ru','$cat_name_eng',
                    '$name1','$name2','$name3','$name4','$infoarm','$inforu','$infoeng',
                    '$hastutyun','$laynutyun','$ogt_laynutyun','$erkarutyun','$catid','$colored','$inhomepage')");


                    header('location: Add-item.php?h='.$protection.'');
            }else{
                header('location: Add-item.php?h='.$protection.'');
            }
    }else{
        header('location: Add-item.php?h='.$protection.'');
    }