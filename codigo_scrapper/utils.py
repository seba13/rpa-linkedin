#!/usr/bin/env python
#_*_ coding: utf8 -*-
import time
import sys
import random
from time import sleep
from tkinter import Button
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.action_chains import ActionChains
import string
from datetime import datetime
from dateutil.relativedelta import relativedelta
from sentiment_analysis_spanish import sentiment_analysis
import mysql.connector
import pyperclip as pc
# from selenium.webdriver import ActionChains
from selenium.webdriver.common.keys import Keys

PAUSE_TIME = random.uniform(2.0, 3.5)



#En caso de haber un error en la mitad de la extracción, borra la data que se ingresó hasta el momento.
def deleteInfoCompany(mycursor, mydb, name_company, admin):
    try:
        #--ELIMINAR COMENTARIOS DE UNA COMPAÑIA--
        query = "DELETE co FROM companies AS c JOIN posts AS p ON c.id_company = p.idCompany RIGHT JOIN comments AS co ON co.idPost = p.id_post WHERE c.name_company = '"+name_company+ "'"
        mycursor.execute(query)
        mydb.commit()
    except:
        print("no se borraron coments")
        ...
    #--ELIMINAR REACCIONES DE UNA COMPAÑIA--
    try:
        query = "DELETE r FROM companies AS c JOIN posts AS p ON c.id_company = p.idCompany RIGHT JOIN reactions AS r ON r.idPost = p.id_post WHERE c.name_company = '"+name_company+ "'"
        mycursor.execute(query)
        mydb.commit()
    except:
        ...
    #--ELIMINAR USUARIOS DE UNA COMPAÑIA--
    try:
        query = "DELETE u FROM users AS u WHERE name_company = '"+name_company+ "'"
        mycursor.execute(query)
        mydb.commit()
    except:
        ...
    #--ELIMINAR POSTS DE UNA COMPAÑIA--
    try:
        query = "DELETE p FROM companies AS c JOIN posts AS p ON c.id_company = p.idCompany WHERE c.name_company = '"+name_company+ "'"
        mycursor.execute(query)
        mydb.commit()
    except:
        ...
    #--ELIMINAR UNA COMPAÑIA--
    try:
        query = "DELETE c FROM companies AS c WHERE c.name_company = '"+name_company+ "'"
        mycursor.execute(query)
        mydb.commit()
    except:
        ...
    if(admin==1):
        try:
            query = "DELETE f FROM followers AS f WHERE f.name_company = '"+name_company+ "'"
            mycursor.execute(query)
            mydb.commit()
        except:
            ...


#se actualiza la fecha de la extracción
def updateExtraction(mycursor, mydb, name_company):
    #se obtiene la fecha de la extracción actual
    now = datetime.now().strftime('%Y/%m/%d %H:%M:%S')
    date = datetime.strptime(now, '%Y/%m/%d %H:%M:%S')
    #Se actualiza extracción
    query = "UPDATE extractions SET last_update='"+str(date)+"' WHERE user_name='"+name_company+"'"
    mycursor.execute(query)
    mydb.commit()

#se espera los segundos ingresados
def wait(seconds):
    print("wait siguiente extraccion")
    for remaining in range(seconds, 0, -1):
        sys.stdout.write("\r")
        sys.stdout.write("{:2d} Esperando para la siguiente extracción...".format(remaining))
        sys.stdout.flush()
        time.sleep(1)

    sys.stdout.write("\rComplete!                                           \n")

#conección a la base de datos
def connectMySql():
    print("conectando...........")
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="demoLinkedinScrapper3"
    )
    mycursor = mydb.cursor()
    return (mycursor, mydb)

#función principal donde se realiza la extracción
def runExtraction(driver, number_company, admin, url_posts, mycursor, mydb):
        
        # espera hasta que la pagina cargue
        pageLoad(driver)
        

    

        print("llega aca")

        #se redirige a los posts de la pagina analizada
        driver.get(url_posts)

        #inserta empresa a db
        
        #se obtiene la fecha de la extracción actual
        now = datetime.now().strftime('%Y/%m/%d %H:%M:%S')
        date = datetime.strptime(now, '%Y/%m/%d %H:%M:%S')
        print(driver.current_url)
        #se obtiene el número de followers de la compañiac
        # elemento_followers = driver.find_element(By.XPATH,"//div[@class='org-top-card-summary-info-list t-14 t-black--light']")
        
        # sleep(5)
        # elemento_followers = WebDriverWait(driver).until(EC.visibility_of_element_located(By.XPATH("//div[@class='org-top-card-summary-info-list t-14 t-black--light']"))).text
        
        
        elemento_followers = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH,"//div[@class='org-top-card-summary-info-list t-14 t-black--light']//div[@class='inline-block']//div[2]"))
        )
        
        
        # elemento_followers = driver.find_element(By.XPATH,'//*[@id="ember33"]/div[2]/div[1]/div[1]/div[2]/div/div/div[2]/div[2]')
        
        # separa el n° de seguidores de la cadena seguidores
        followersStr = (elemento_followers.text).split()
        followersStr = (followersStr[0])
        followersStr = followersStr.replace('.','')
        followers = int(followersStr)
        print("followers: {}".format(followers))

        #se obtiene nombre de la compañia
        # name_company_elemento = driver.find_element(By.XPATH,'//section[contains(@class, "org-top-card")]//h1')
        name_company_elemento = driver.find_element(By.XPATH,"//section[@class='org-top-card artdeco-card']//h1")
        name_company = str(name_company_elemento.get_attribute("title")).rstrip()

        print("nombre compañia: {}".format(name_company))

        #se verifica si ya está en la bd la compañia ingresada
        if (existsCompany(mycursor, name_company)):
            print("Existe compaia en base de datos")
            descriptionLastestPost = getDescriptionLatestPost(mycursor, name_company) #se obtiene la descripción del post publicado por la compañia
            id_company = getIdCompany(mycursor, name_company) #se obtiene el id de la compañia

        else:
            print("compañia no encontrada en base de datos")
            descriptionLastestPost = ''
            #se inserta la compañia a la base de datos
            sqlCompany = ("INSERT INTO companies "
                "(name_company, followers, date) "
                "VALUES (%(name_company)s, %(followers)s, %(date)s)")
            company_values = {
                'name_company': name_company,
                'followers': followers,
                'date': date,
            }
            mycursor.execute(sqlCompany, company_values)
            mydb.commit()
            id_company = mycursor.lastrowid

        #se extrae información de los seguidores de la compañía, si es que se extrae desde una cuenta con permisos necesarios
        if(admin == True):
            try:
                getFollowers(driver, number_company, id_company, mycursor, mydb)
            except:
                print("Esta cuenta no es admin")
        
        

        # driver.get(url_posts)
        sortPostByDates(driver)
        scroll40Posts(driver)

        #se obtienen los elementos clickeables para ver cada reaccion de los posts
        print("obteniendo lista reacciones post")
        elementos_reaccion = driver.find_elements(By.XPATH, '//div[contains(@class, "occludable-update ember-view")]/div[contains(@data-urn, "urn:li:activity")]/div[1]//ul/li/button[contains(@aria-label, "reac")]')
        
        #se obtienen elementos de fechas y posts(descripción e información de comentarios)
        print("obteniendo lista cajas posts")
        elementos_descripcion_comentarios = driver.find_elements(By.XPATH, '//div[contains(@class, "occludable-update ember-view")]')


        print("obteniendo lista fechas posts")
        elementos_fechas = driver.find_elements(By.XPATH, '//div[contains(@data-urn, "urn:li:activity")][1]/div/div[1]/a/div[contains(@class,"actor__meta")]//span[contains(@class,"visually-hidden")]')

        #se presionan botones necesarios para ver todos los comentarios
        verComentarios(driver)
        

        count_posts = 1


        # Creación de objeto ActionChain
        action = ActionChains(driver)

        for descripcion_comentario, fecha_post, buton_reaccion in zip(elementos_descripcion_comentarios, elementos_fechas, elementos_reaccion):
        
            urlPost = ""
            
            
        #try:
        # try:

            times = 0
            while times < 2:
                print("Capturando enlaces de los post")
                sleep(3)
                # capturar elemento boton (...) post
                btn_opt_control = WebDriverWait(driver,30).until(
                    EC.element_to_be_clickable((descripcion_comentario.find_element(By.XPATH,'.//div[@class="feed-shared-control-menu feed-shared-update-v2__control-menu absolute text-align-right"]//div[contains(@class,"artdeco-dropdown artdeco-dropdown--placement-bottom")]//button[@class="feed-shared-control-menu__trigger artdeco-button artdeco-button--tertiary artdeco-button--muted artdeco-button--1 artdeco-button--circle artdeco-dropdown__trigger artdeco-dropdown__trigger--placement-bottom ember-view"]')))
                )
                # btn_opt_control.click()
                # se mueve donde esta el boton (...) para capturar copiar enlace y luego le hace click
                # action.move_to_element(btn_opt_control).click().perform()

                action.move_to_element(btn_opt_control).perform()
                sleep(2)
                action.click(on_element= btn_opt_control).perform()

                
                 # print("escrolleando al post")
                # driver.execute_script('arguments[0].scrollIntoView({block:"center", behavior: "smooth"})', btn_opt_control)
                # sleep(10)

                # btn_opt_control.click()
                sleep(5)

                print("presionando boton obtener enlace")


                # presionar boton copiar url

                try:
                    btn_copy_clipboard_url = WebDriverWait(driver, 30).until(
                        EC.element_to_be_clickable((descripcion_comentario.find_element(By.XPATH,'.//div[contains(@class,"feed-shared-control-menu__content")]//li[2]')))
                    ).click()
                    break
                except:
                    print("no se pudo presionar copiar enlace publicacion")
                    times+=1

            

            # Cerrando modal copiado de portapapeles
            btn_close_modal_clipboard = WebDriverWait(driver,30).until(
                EC.element_to_be_clickable((By.XPATH,'//button[contains(@class,"artdeco-toast-item__dismiss") and contains(@aria-label,"Descartar")]'))
            ).click()

            print("url post copiado a portapapeles")
            print("enlace post:{}".format(pc.paste()))
            urlPost = pc.paste()


        # except:
            # print("no fue posible capturar enlace post")
            # pass

            print("Capturando la descrpcion de post")

            # descripcion = descripcion_comentario.find_element(By.XPATH, './div[contains(@data-urn, "urn:li:activity")]/div/div[3]')
            # print("Descripcion comentarios:"+descripcion.text)

            # corregido
            # almacena la descripcion del post, incluso si fue compartido de otro post
            # descripcion = descripcion_comentario.find_element(By.XPATH, '//div[contains(@data-urn, "urn:li:activity")]//div//div[@class="feed-shared-update-v2__description-wrapper"] | //div[@class="feed-shared-mini-update-v2 feed-shared-update-v2__update-content-wrapper artdeco-card"]//div[contains(@class,"feed-shared-inline-show-more-text")]')
            # print("Descripcion comentarios:"+descripcion.text)
            descripcion_post = descripcion_comentario.find_element(By.XPATH, './/div[contains(@data-urn, "urn:li:activity")]//div[contains(@class,"feed-shared-update-v2__description")]//div[contains(@class,"feed-shared-text")]')
            print("Descripcion post:"+descripcion_post.text)


            print("obteniendo caja de inf de cada comentario")
            # corregido
            elementos_nombres_cargos= descripcion_comentario.find_elements(By.XPATH, './/div[contains(@data-urn,"urn:li:activity")]//div[contains(@class,"comments-container")]//div[contains(@class,"comments-comments-list")]//article[contains(@class,"comments-comment-item")]')
            
            

            # elementos_urls_users_comentarios = descripcion_comentario.find_elements(By.XPATH, './div[contains(@data-urn, "urn:li:activity")]//div[contains(@class, "comments-container")]/div[contains(@class, "comments-comments-list")]//*[self::article[contains(@class, "comments-comment-item")]]/div/a[2]')
            print("Obteniendo urls de usuarios")
            # corregido
            elementos_urls_users_comentarios = descripcion_comentario.find_elements(By.XPATH, './/div[contains(@data-urn, "urn:li:activity")]//div[contains(@class,"comments-container")]//div[contains(@class,"comments-comments-list")]//article[contains(@class,"comments-comment-item")]/div[contains(@class,"comments-post-meta")]//div[@class="comments-post-meta__profile-info-wrapper display-flex"]//a')
            

          


            #para de recorrer los posts si se encuentra que el post actual es igual al último ingresado en la extracción pasada.
            if(descriptionLastestPost == descripcion_post.text):
                print("break por descripcion = descripción")
                break
            if (count_posts == 1):
                updateLatestPost(mycursor,mydb, name_company)#se actualiza el último post anterior
                latest_post = 1 #post actual será el último post
            else:
                latest_post = 0

            

            #se inserta post en base de datos
            sqlPost = ("INSERT INTO posts "
                        "(idCompany, name_company, description, url_post, published_date, latest) "
                        "VALUES (%(idCompany)s, %(name_company)s, %(description)s, %(url_post)s, %(published_date)s, %(latest)s)")
            
            print("fecha post: "+fecha_post.text)
            post_values = {
                'idCompany': id_company,
                'name_company': name_company,
                'description': descripcion_post.text,
                'url_post': urlPost,
                'published_date' : getDate(fecha_post.text),
                'latest' : latest_post
            }
            print("guardando post en base de datos")
            mycursor.execute(sqlPost, post_values)
            mydb.commit()
            id_post = mycursor.lastrowid
            
            #elementos que contienen la info de los comentarios del post actual
            print("obteniendo elementos comentarios")
            elementos_comentarios = descripcion_comentario.find_elements(By.XPATH, './/div[contains(@class,"comments-container")]//div[contains(@class,"comments-comments-list")]//article[contains(@class,"comments-comment-item")]')

            i=1

            # for el in elementos_comentarios:
            #     print("elemento comentario:"+el.text)

            #se recorren los comentarios del post actual


            # print("elementos comentarios {}".format(elementos_comentarios))

            # print("elementos nombres cargo {}".format(elementos_nombres_cargos))



            for comentario, nombre_cargo in zip(elementos_comentarios, elementos_nombres_cargos):
                
                print("entra en ciclo for comentarios")

                nombre_comentario = nombre_cargo.find_element(By.XPATH, './div//a/h3/span/span[1]')
                nombre_comentario = nombre_comentario.text
                print("nombre comentario:"+nombre_comentario)
                fecha_comentario = nombre_cargo.find_element(By.XPATH, './/time')
                fecha_comentario = fecha_comentario.text
                print("fecha comentario:"+fecha_comentario)
                url_user_comentario = nombre_cargo.find_element(By.XPATH, './/div[contains(@class,"comments-post-meta")]//a[contains(@id,"ember") and contains (@class,"ember-view")]')
                url_user_comentario = str(url_user_comentario.get_attribute("href")).rstrip(' ')
                print("url user comentario:"+url_user_comentario)

                if('/tetris' in url_user_comentario):
                    print("cadena include /tetris")
                    url_user_comentario = url_user_comentario.replace("/tetris","")

                try:
                    cargo_comentario = nombre_cargo.find_element(By.XPATH, './/h3/span[position() = last()]')
                    cargo_comentario = (cargo_comentario).text
                    print("Cargo comentario:"+cargo_comentario)
                except NoSuchElementException:
                    cargo_comentario = ''

                # Captura el mensaje de cada comentario de los usuarios
                partes_comentario = comentario.find_element(By.XPATH, './/span[@class="comments-comment-item__main-content feed-shared-main-content--comment t-14 t-black t-normal"]//span[@dir="ltr"]')
                
                contenido=''

                #se recorren las distintas partes que conforman un comentario
                # for parte_comentario in partes_comentario:
                #     print("parte comentario: {}".format(parte_comentario.text))
                #     contenido = contenido + parte_comentario.text}
                contenido += partes_comentario.text
                print("contenido: "+contenido)
                #se inserta comentario a db
                sqlComment = ("INSERT INTO comments "
                        "(idPost, name, job, published_date, comment,sentiment,url_user) "
                        "VALUES (%(idPost)s, %(name)s, %(job)s, %(published_date)s, %(comment)s, %(sentiment)s,%(url_user)s)")
                comment_values = {
                    'idPost': id_post,
                    'name': nombre_comentario,
                    'job': cargo_comentario,
                    'published_date' : getDate(fecha_comentario),
                    'comment' : contenido,
                    'sentiment' : sentimentAnalysis(contenido),
                    'url_user' : url_user_comentario
                }
                mycursor.execute(sqlComment, comment_values)
                mydb.commit()
                id_comment = mycursor.lastrowid

                #se extrae info del autor del comentario
                getUserInfo(url_user_comentario,nombre_comentario, cargo_comentario, driver, mycursor, mydb, id_company)
                
                i=i+1

            print("fuera ciclo for comentarios")
            #Se abre ventanas de reacciones
            
            driver.execute_script('arguments[0].click();', buton_reaccion)
            
            scrollVentanaReacciones(driver)
            elemento_nombres = WebDriverWait(driver, 50).until(
                EC.presence_of_all_elements_located((By.XPATH, '//div[@id="artdeco-modal-outlet"]//li[contains(@class,"artdeco-list__item")]//span[@dir="ltr"]'))
            )
            elemento_nombres = driver.find_elements(By.XPATH, '//div[@id="artdeco-modal-outlet"]//li[contains(@class,"artdeco-list__item")]//span[@dir="ltr"]')
            elemento_urls = driver.find_elements(By.XPATH, '//div[@id="artdeco-modal-outlet"]//li[contains(@class,"artdeco-list__item")]/a')
            elemento_cargos = driver.find_elements(By.XPATH, '//div[@id="artdeco-modal-outlet"]//li[contains(@class,"artdeco-list__item")]//div[contains(@class,"artdeco-entity-lockup__caption")]')
            
            # print("URL :"+elemento_urls[1].text)
            # print("CARGO :"+elemento_cargos[1].text)
            # print("NOMBRE :"+elemento_nombres[1].text)
            elemento_tipos_reacciones = driver.find_elements(By.XPATH, '//img[contains(@class,"reactions-icon social-details-reactors-tab-body")]')

            # print("TIPO : "+elemento_tipos_reacciones[1].text)

            # elemento_nombres = []
            # elemento_urls  = []
            # elemento_cargos = []
            # elemento_tipos_reacciones = []
            #se recorren los usuarios de la ventana reacciones
            for nombre, cargo, url_user , tipo_reaccion in zip(elemento_nombres, elemento_cargos, elemento_urls , elemento_tipos_reacciones):
                url_user=str(url_user.get_attribute("href")).rstrip(' ')
                #print("URL : "+url_user)
                nombre=(str(nombre.text)).rstrip(' ')
                #print("NOMBRE : "+nombre)
                cargo=(str(cargo.text)).rstrip(' ')
                #print("CARGO : "+cargo)
                getUserInfo(url_user,nombre, cargo, driver, mycursor, mydb, id_company)
                tipo_reaccion=str(tipo_reaccion.get_attribute("alt")).rstrip(' ')
                tipo_reaccion=tipo_reaccion.capitalize()
                #se agrega la reacción a la base de datos
                sqlReaction = ("INSERT INTO reactions "
                        "(idPost, name, job, reaction, url_user) "
                        "VALUES (%(idPost)s, %(name)s, %(job)s, %(reaction)s, %(url_user)s)")
                reaction_values = {
                    'idPost': id_post,
                    'name': nombre,
                    'job': cargo,
                    'reaction' : tipo_reaccion,
                    'url_user' : url_user
                }
                mycursor.execute(sqlReaction, reaction_values)
                mydb.commit()
                id_reaction = mycursor.lastrowid

            #se cierra ventana de reacciones
            boton_cerrar = driver.find_element(By.XPATH, '//div[@id="artdeco-modal-outlet"]//button[contains(@class, "artdeco-modal")]')
            boton_cerrar.click()

            #se verifica si es el post número 40, para terminar la extracción
            if count_posts == 2:
                break
            count_posts=count_posts+1
        
    #except:
    #    print("ERROR")

#se scrollea hasta el final o hasta cargar 42 posts
def scroll40Posts(driver):
    

    print("Scrolleando posts...")

    #Num posts
    posts = driver.find_elements(By.XPATH, '//div[contains(@data-urn, "urn:li:activity")]')
    
    #SCROLL
    # SCROLL_PAUSE_TIME = random.uniform(3.0, 4.5)

    # Get scroll height
    last_height = driver.execute_script("return document.body.scrollHeight")

    while True:
        # Scroll down to bottom
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        posts = driver.find_elements(By.XPATH, '//div[contains(@data-urn, "urn:li:activity")]')
        # Wait to load page
        sleep(PAUSE_TIME)
        
        new_height = driver.execute_script("return document.body.scrollHeight")
        
        if len(posts) >= 3:
            break
        if new_height == last_height:
            break
        last_height = new_height
    print("Fin Scrolleo")

#se scrollea hasta el final la ventana de reacciones
def scrollVentanaReacciones(driver):
    #SCROLL

    # SCROLL_PAUSE_TIME = random.uniform(3.0, 4.5)
    PIXELS = 2000000

    last_height = driver.find_elements(By.XPATH, '//div[@class="artdeco-modal__content social-details-reactors-modal__content ember-view"]//ul/li')

    while True:
        # Scroll down to bottom
        driver.execute_script("document.getElementsByClassName('artdeco-modal__content social-details-reactors-modal__content ember-view')[0].scroll(0, "+str(PIXELS)+")")

        # Wait to load page
        sleep(PAUSE_TIME)
        
        #new_height = driver.execute_script("return document.getElementsByClassName('artdeco-modal__content social-details-reactors-modal__content ember-view')")
        new_height = driver.find_elements(By.XPATH, '//div[@class="artdeco-modal__content social-details-reactors-modal__content ember-view"]//ul/li')
        if new_height == last_height:
            break
        last_height = new_height
        PIXELS = PIXELS+20000

def cargarComentariosPost(driver):
    """se presiona el botón ver más comentarios de cada post, hasta que no hayan más comentarios para ver"""
    #Pausa
    # PAUSE_TIME = random.uniform(3.0, 4.5)

    #Comentarios iniciales
    last_height = driver.execute_script("return document.getElementsByClassName('comments-comments-list comments-comments-list--expanded ember-view')")

    while True:
        try:
            # Press button
            print("presionando boton 'Mostrar mas comentarios' posts")
            boton_mas_comentarios = driver.find_element(By.XPATH, '//div[contains(@class, "comments-container")]/div[contains(@class, "comments-comments-list")]//div[contains(@class, "comments-comments-list")][1]/button/span')
            driver.execute_script('arguments[0].click();',boton_mas_comentarios)
            # Wait to load page
            sleep(PAUSE_TIME)
            new_height = driver.execute_script("document.getElementsByClassName('comments-comments-list comments-comments-list--expanded ember-view')")

            if new_height == last_height:
                break
            #last_height = new_height
        except NoSuchElementException:
            break


def cargarComentariosRespuestas(driver):
    """se presionan los botones para ver respuestas anteriores a un comentario"""
    # Press button

    # PAUSE_TIME = random.uniform(3.0, 4.5)
    print("presionando 'Cargar respuestas anterior' de comentarios")
    botones_ver_respuestas = driver.find_elements(By.XPATH, '//div[contains(@data-urn, "urn:li:activity")]//div[contains(@class, "comments-container")]/div[contains(@class, "comments-comments-list")]//*[self::article[contains(@class, "comments-comment-item")]]//button[contains(@class, "show-prev-replies")]')
    for boton in botones_ver_respuestas:
        driver.execute_script('arguments[0].click();',boton)
    sleep(PAUSE_TIME)

def getDate(timeString):
    """se transforma de formato cadena a formato date"""
    
    now = datetime.now() 
    time = timeString.split(' ')
    
    if(len(time) == 2 or len(time) == 1):
        
        if( time[1][:3] == 'seg' or time[1][:3] == 'min' or time[1][:3] == 'hor' or time[0]== 'Ahora'):
            date = now.strftime('%Y-%m-%d')
            return date
    
        number = int(time[0])
        unit = time[1][0]
        
        if(unit == 'd'):
            date = now - relativedelta(days = number)
            date = date.strftime('%Y-%m-%d')
        
        if(unit == 's'):
            date = now - relativedelta(weeks = number)
            date = date.strftime('%Y-%m-%d')
        
        if(unit == 'm'):
            date = now - relativedelta(months = number)
            date = date.strftime('%Y-%m-%d')
        
        if(unit == 'a'):
            date = now - relativedelta(years = number)
            date = date.strftime('%Y-%m-%d')
    
    else:
        
        if( time[2][:3] == 'seg' or time[2][:3] == 'min' or time[2][:3] == 'hor'):
            date = now.strftime('%Y-%m-%d')
            return date
    
        number = int(time[1])
        unit = time[2][0]
        
        if(unit == 'd'):
            date = now - relativedelta(days = number)
            date = date.strftime('%Y-%m-%d')
        
        if(unit == 's'):
            date = now - relativedelta(weeks = number)
            date = date.strftime('%Y-%m-%d')
        
        if(unit == 'm'):
            date = now - relativedelta(months = number)
            date = date.strftime('%Y-%m-%d')
        
        if(unit == 'a'):
            date = now - relativedelta(years = number)
            date = date.strftime('%Y-%m-%d')
    
    date = datetime.strptime(date, '%Y-%m-%d')
    return date

def dateStrToISODate(dateString):
    """se transforma de str a formato date"""
    dateStr = dateString.split(' ')
    monthNames = {
        "enero": "01",
        "febrero": "02",
        "marzo": "03",
        "abril": "04",
        "mayo": "05",
        "junio": "06",
        "julio": "07",
        "agosto": "08",
        "septiembre": "09",
        "octubre": "10",
        "noviembre": "11",
        "diciembre": "12",
    }

    date = datetime.strptime((dateStr[2]+'-'+monthNames[dateStr[0]]+'-'+'01'), '%Y-%m-%d')
    return date

def verComentarios(driver):
    """Se hacen clicks necesarios para poder ver los comentarios de cada post"""
    elementos_botones_ver_comentarios = driver.find_elements(By.XPATH,'//ul/li[2]/button[contains(@aria-label, "comentario")]/span')
    print("Presionando boton para ver comentario posts")
    for elemento in elementos_botones_ver_comentarios:
        driver.execute_script('arguments[0].click();', elemento)
    sleep(2)
    cargarComentariosPost(driver)
    cargarComentariosRespuestas(driver)

def getFollowers(driver, company_number, id_company, mycursor, mydb):
    """se extraen los followers de la empresa"""

    url_followers = 'https://www.linkedin.com/company/'+company_number+'/admin/analytics/followers/'
    
    driver.get(url_followers)

    boton_ver_followers = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, '//table/tbody/tr/td/button'))
        )
    driver.execute_script('arguments[0].click();', boton_ver_followers)
    scrollVentanaFollowers(driver)

    #obtener lista de nombres
    elementos_nombres = driver.find_elements(By.XPATH, '//tbody/tr/td[contains(@class, "org-view-page-followers-modal")][1]/a/div[contains(@class, "align-items-center")]/div[contains(@class, "content")]/div[1]')
    #obtener lista de cargos
    elementos_cargos = driver.find_elements(By.XPATH, '//tbody/tr/td[contains(@class, "org-view-page-followers-modal")][1]/a/div[contains(@class, "align-items-center")]/div[contains(@class, "content")]/div[position() = last()]')
    #obtener lista de fechas que se unieron
    elementos_fechas_seguimiento = driver.find_elements(By.XPATH, '//tbody/tr/td[contains(@class, "org-view-page-followers-modal")][2]/span/span[1]')
    #obtener lista de urls de usuarios
    elementos_urls_users = driver.find_elements(By.XPATH, '//tbody/tr/td[contains(@class, "org-view-page-followers-modal")][1]/a')

    for nombre, cargo, fecha, url_user in zip(elementos_nombres, elementos_cargos, elementos_fechas_seguimiento, elementos_urls_users):
        nombre = nombre.text
        cargo = cargo.text
        fecha = fecha.text
        url_user = str(url_user.get_attribute("href")).rstrip(' ')

        
        sqlFollower= ("INSERT INTO followers "
            "(idCompany, name, job, date_follow, url_user) "
            "VALUES (%(idCompany)s, %(name)s, %(job)s, %(date_follow)s, %(url_user)s)")
        follower_values = {
            'idCompany': id_company,
            'name': nombre,
            'job': cargo,
            'date_follow': dateStrToISODate(fecha),
            'url_user': url_user
        }
        mycursor.execute(sqlFollower, follower_values)
        mydb.commit()
        id_follower = mycursor.lastrowid
        
        getUserInfo(url_user,nombre, cargo, driver,mycursor, mydb, id_company)

def scrollVentanaFollowers(driver):
    """se scrollea ventana de followers hasta el final"""

    #SCROLL
    # SCROLL_PAUSE_TIME = random.uniform(2.0, 3.5)
    PIXELS = 2000000
    # Get scroll height

    last_height = driver.find_elements(By.XPATH, '//table[contains(@class, "table")]/tbody/tr/td[1]')

    while True:
        # Scroll down to bottom
        driver.execute_script("document.getElementsByClassName('artdeco-modal__content org-view-page-followers-modal__content artdeco-modal__content--no-padding ember-view')[0].scroll(0,"+ str(PIXELS) +")")
        
        # Wait to load page
        sleep(PAUSE_TIME)

        #new_height = driver.execute_script("return document.getElementsByClassName('artdeco-modal__content social-details-reactors-modal__content ember-view')")
        new_height = driver.find_elements(By.XPATH, '//table[contains(@class, "table")]/tbody/tr/td[1]')

        if new_height == last_height:
            break
        last_height = new_height   
        PIXELS =PIXELS+200000

def sentimentAnalysis(comment): 
    """se analisa el sentimiento de un comentario comentario y se retorna neutro, positivo o negativo"""
    sentiment = sentiment_analysis.SentimentAnalysisSpanish()
    sentiment_number = float(format(sentiment.sentiment(comment), "9.6f"))

    print("comentario sentimiento:{}".format(comment))
    print("numero sentimiento:{}".format(sentiment_number))

    res='neutro'
    if(sentiment_number>= 0.6):
        res="positivo"
        return res
    if(sentiment_number<= 0.4):
        res="negativo"
        return res
    return res

def getUserInfo(url_user,name, job, driver,mycursor, mydb, id_company):
    """se extrae informacion de los usuarios de la empresa"""
    # PAUSE_TIME = random.uniform(0.3,1)
    sleep(PAUSE_TIME)
    
    query = "SELECT * FROM users WHERE url_user='"+url_user+"'"
    mycursor.execute(query)
    myresult = mycursor.fetchall()

    if ( len(myresult) == 0 ):
        driver.execute_script("window.open('"+url_user+"', '_blank')")
        driver.switch_to.window(driver.window_handles[1])
        
        pageLoad(driver)

        print("url actual:"+driver.current_url)

        number_followers = getFollowersUser(driver)

        try:
            print("Buscando boton mostrar mas experiencia")
            # dependiendo del navegador varia la estructura
            try:
                btn_show_more_experience = WebDriverWait(driver,5).until(
                    EC.presence_of_element_located((By.XPATH, '//main[@id="main"]//section[@id="experience-section"]//button[contains(@class,"pv-profile-section__see-more-inline")]'))
                ).click()
            except:
                try:
                    btn_show_more_education = WebDriverWait(driver,5).until(
                    EC.presence_of_element_located((By.XPATH, '//section[contains(@class,"artdeco-card")]//div[@id="experience"]/ancestor::section//span[@class="pvs-navigation__text"]'))
                    ).click()
                except:
                    raise Exception
        except:
            print("Boton mostrar experiencia no encontrado")
            pass     
        
        try:
            print("Buscando boton ver todos los puestos")
            btn_show_more_job = WebDriverWait(driver,5).until(
                EC.element_to_be_clickable((By.XPATH,'//div[@class="pvs-list__footer-wrapper"]//div[@class="pv2"]/a'))
            ).click()
        except:
            print("no se encontró boton ver todos los puestos")



        # obtiene la informacion de la experiencia del usuario
        string_experience = getExperienceUser(driver)

        if(string_experience ==''):
            string_experience = getExperienceUserCase2(driver)

        try:
            #botón ver más formación 
            print("Buscando boton mostrar mas titulaciones")
            try:
                btn_show_more_education = WebDriverWait(driver,5).until(
                    EC.presence_of_element_located((By.XPATH, '//main[@id="main"]//section[@id="education-section"]//button[contains(@class,"pv-profile-section__see-more-inline")]'))
                ).click()
            except:
                try:
                    btn_show_more_education = WebDriverWait(driver,5).until(
                    EC.presence_of_element_located((By.XPATH, '//section[contains(@class,"artdeco-card")]//div[@id="education"]/ancestor::section//a[contains(@class,"optional-action-target-wrapper")]//span[@class="pvs-navigation__text"]'))
                    ).click()
                except:
                    raise Exception
        except:
            print("Boton mostrar mas titulaciones no encontrado")
            pass


        # obtiene la informacion educacional del usuario
        string_education = getEducationUser(driver)

         # obtiene la informacion de numero de seguidores

        if string_education=="":
            string_education = getEducaciontUserCase2(driver)



       



        try:
            #locacion
            location = driver.find_element(By.XPATH, '//main//div[contains(@class, "flex-1")]/ul[2]/li[1]') #locacion
            location = location.text
        except:
            try:
                #locacion empresa
                location = driver.find_element(By.XPATH, '//section/div/div/div[1]/div/div[1]/div[2]/div/div/div[2]/div[contains(@class, "org-top-card-summary")][1]')
                location = location.text
            except:
                location = 'Ubicación no disponible'

      
        try:
            sqlUser = ("INSERT INTO users "
                        "(idCompany, name, job, number_followers, education,experience,url_user) "
                        "VALUES (%(idCompany)s, %(name)s, %(job)s, %(number_followers)s, %(education)s, %(experience)s, %(url_user)s)")
            user_values = {
                'idCompany': id_company,
                'name': name,
                'job': job,
                'number_followers' : number_followers,
                'education' : string_education,
                'experience' : string_experience,
                'url_user' : url_user
            }
            mycursor.execute(sqlUser, user_values)
            mydb.commit()
            id_user = mycursor.lastrowid


        except:
            sqlUser = ("INSERT INTO users "
                        "(idCompany, name, job, number_followers, education,experience,url_user) "
                        "VALUES (%(idCompany)s, %(name)s, %(job)s, %(number_followers)s, %(education)s, %(experience)s, %(url_user)s)")
            user_values = {
                'idCompany': id_company,
                'name': name,
                'job': job,
                'number_followers' : number_followers,
                'education' : 'no disponible',
                'experience' : 'no disponible',
                'url_user' : url_user
            }
            mycursor.execute(sqlUser, user_values)
            mydb.commit()
            id_user = mycursor.lastrowid
        
        driver.close()
        driver.switch_to.window(driver.window_handles[0])
    

def getDescriptionLatestPost(mycursor, name_company):
    """se obtiene la descripción del último post almacenado en la base de datos"""
    query = "SELECT posts.description FROM companies as c INNER JOIN posts ON c.id_company = posts.idCompany WHERE posts.latest = 1 AND c.name_company='"+name_company+"';"
    mycursor.execute(query)
    myresult = mycursor.fetchall()

    # if(len(myresult)==0):
    #     print("entra aca")
    #     return ""

    if(len(myresult)==0):
        return ""

    return((myresult[0])[0]) #description post

def getIdCompany(mycursor, name_company):
    """Se obtiene id de una compañia según el nombre (username)"""
    query = "SELECT id_company FROM companies WHERE name_company='"+name_company+"'"
    mycursor.execute(query)
    myresult = mycursor.fetchall()
    return((myresult[0])[0])

def existsCompany(mycursor, name_company):
    """si existe la compañia del nombre ingresado(username) 
    retorna true, en caso contrario false"""
    query = "SELECT * FROM companies WHERE name_company='"+name_company+"'"
    mycursor.execute(query)
    myresult = mycursor.fetchall()
    
    if ( len(myresult) == 0 ):
        return False
    return True

def updateLatestPost(mycursor,mydb,name_company):
    """actualiza el capo latest de un post en la base de datos"""
    query = "UPDATE posts SET latest=0 WHERE latest=1 and name_company='"+name_company+"'"
    mycursor.execute(query)
    mydb.commit()

def sortPostByDates(driver):
    
    """se presionan los botones necesarios para ordenar las publicaciones por fecha de publicación"""
    
    
    print("metodo ordenacion fechas")
    sleep(1)
    
    print("presionar boton close chat")
    # Debido a que los ember id van cambiando y tienen la misma clase
    # es necesario seleccionar el elemento por su posición
    button_close_chat = WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.XPATH, "//aside[@id='msg-overlay']//header[@class='msg-overlay-bubble-header']//button[@class='msg-overlay-bubble-header__control msg-overlay-bubble-header__control--new-convo-btn artdeco-button artdeco-button--circle artdeco-button--muted artdeco-button--1 artdeco-button--tertiary ember-view'][2]"))
    )
    button_close_chat.click()
    print("cerrando chat")
    
    print("Presionar boton recientes")
    
    
    times = 0 
    while times<2:

        try:
            button_sort_by = WebDriverWait(driver, 20).until(
                EC.element_to_be_clickable((By.XPATH,'//div[@class="org-grid__content-height-enforcer"]//div[@class="sort-dropdown mt2 ml1"]//button[@class="artdeco-dropdown__trigger artdeco-dropdown__trigger--placement-bottom ember-view display-flex t-normal t-12 t-black--light" and @data-control-name="feed_sort_dropdown_trigger"]'))
            )
            button_sort_by.click()
            print("boton desplegable presionado")
            button_sort_by_recent = WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.XPATH,'//div[@class="org-grid__content-height-enforcer"]//div[@class="sort-dropdown mt2 ml1"]//button[@class="artdeco-dropdown__trigger artdeco-dropdown__trigger--placement-bottom ember-view display-flex t-normal t-12 t-black--light" and @data-control-name="feed_sort_dropdown_trigger"]/following-sibling::div//ul/li[2]//div'))
            )
            
            button_sort_by_recent.click()
            print("post ordenados por recientes")
            break
        except TimeoutException:
            print("no se logro presionar boton")
            times+=1
    # sleep(10)
    # exit()
    
    
    # print("presionar boton desplegable")
    # Button_sort = WebDriverWait(driver, 10).until(
    #     EC.element_to_be_clickable((By.XPATH,"//main[@id='main']//button[@id='ember980']"))
    # ).click()
    
    # print("presionar boton sort recientes")
    # Button_sort_recientes = WebDriverWait(driver, 10).until(
    #     EC.presence_of_element_located((By.XPATH,"//div[@id='ember981']"))
    # ).click()
  
   
    
    # driver.execute_script('arguments[0].click();', button_close_chat)
    
    # sleep(2)
    # while(True):
    #     try:
    #         print("presionar boton ordenar recientes")
    #         WebDriverWait(driver, 10)\
    #             .until(EC.element_to_be_clickable((By.XPATH,'//main//div[@class="grid__col--lg-17 grid__col ph0"]//button[@id="ember438"]')))\
    #             .click()
    #         break
    #     except:
    #         print("exception encontrado")
            
    
    
    # #se presiona el boton para ordenar publicaciones desde el mas reciente
    # button_order_by = WebDriverWait(driver, 10).until(
    #         EC.presence_of_element_located((By.XPATH, '//div[contains(@class,"display-flex")]/div[contains(@class, "sort-dropdown ember-view mt2")]/div/button'))
    #     )
    # location_button = button_order_by.location

    # #se despliega menú para ordenar por reciente
    # ac = ActionChains(driver)
    # ac.move_by_offset(location_button['x'], location_button['y']).click().perform()
    
    # #se seleccionla la opción ordenar por reciente
    # button_option = WebDriverWait(driver, 10).until(
    #         EC.presence_of_element_located((By.XPATH, '//div[contains(@class,"display-flex")]/div[contains(@class, "sort-dropdown ember-view mt2")]/div/div//ul/li[2]'))
    #     )
    # location_option = button_option.location

    # driver.execute_script('el = document.elementFromPoint('+str(location_option['x'])+', '+str(location_option['y'])+'); el.click();')




def getFollowersUser(driver):
    """Captura informacion del numero de seguidores del usuario"""
    # pageLoad(driver)
    number_followers = 0;
    try:
        number_followers = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.XPATH, '//main//section/div[contains(@class, "ph5")]//ul[contains(@class, "pv-top-card--list-bullet")]/li[@class="text-body-small t-black--light inline-block"]/span'))
        )
        # print("Numero de seguidores usuario:{}".format(number_followers.text))
        #numero de seguidores
        # number_followers = number_followers.text
        # number_followers = number_followers.split(' ')
        # if (len(number_followers)==2):
        #     number_followers = int(number_followers[0])
        # else:
        #     number_followers = int(number_followers[1])
        try:
            number_followers = int(number_followers.text)
        except:
            print("error al parsear numero ")
            number_followers = 0
        # return number_followers
    except:
        try:
            number_followers = driver.find_element(By.XPATH, '//div[@class="pv-deferred-area ember-view"]//div[@class="pv-deferred-area__content"]//section[@class="pv-profile-section pv-recent-activity-section-v2 artdeco-card p5 mt4 ember-view"]//span[@class="align-self-center t-14 t-black--light"]')
            
            
            number_followers = number_followers.text.split()
            number_followers = number_followers[0].replace('.','')
            number_followers = int(number_followers)

        except NoSuchElementException:
            try:
                print("entra en este bloque try , obtener n° seguidores")
                # devuelve una cadena con el n° de seguidores  
                # ej: 1.590 seguidores
                number_followers = driver.find_element(By.XPATH,'//section[contains(@class,"artdeco-card")]//div[@class="pvs-header__container"]//p[@class="pvs-header__subtitle text-body-small"]//span[@aria-hidden="true"]')

                # print("numero de seguidores: {}".format(number_followers.text))

                number_followers = number_followers.text.split()
                number_followers = number_followers[0].replace('.','')
                number_followers = int(number_followers)

            except NoSuchElementException:
                print("numero de seguidores no encotrados")
                number_followers = 0
            except ValueError:
                raise Exception
        except ValueError:
            print("error al parsear numero")
            number_followers = 0
    print("numero de seguidores:{}".format(number_followers))      
    return number_followers




def getEducationUser(driver):
    """Captura informacion de la formación profesional del usuario caso 1"""

    pageLoad(driver)
    sleep(5)
    print("url actual user:"+driver.current_url)
    print("obtener informacion formacion profesional caso 1")
    #lista de establecimientos de formación académica
    # education = driver.find_elements(By.XPATH,'//section[@id="education-section"]//ul[contains(@class,"pv-profile-section__section-info")]//div[@class="pv-entity__degree-info"]//h3')
    
    string_education = ""
    

    # si tiene mas informacion educacional al presionar el boton
    # se lleva a otra direccion url con distinta estructura
    if (not "/details/education/" in driver.current_url):
        
        


        # metodo find_elements no lanza exception nosuchexception
        educations = driver.find_elements(By.XPATH,'//section[@id="education-section"]//div[@class="pv-entity__degree-info"]')
        
        if(len(educations)==0):
            educations = driver.find_elements(By.XPATH,'//div[@id="education"]/ancestor::section[contains(@class,"artdeco-card")]//div[@class="display-flex flex-column full-width align-self-center"]')
            
            for i,education in enumerate(educations):
                
                try:
                    education_institution = education.find_element(By.XPATH,'.//div[@class="display-flex align-items-center"]//span[contains(@class,"t-bold")]//span[@aria-hidden="true"]') 
                except NoSuchElementException:
                    print("no se encontro institucion")

                try:   
                    education_degree = education.find_element(By.XPATH,'.//span[@class="t-14 t-normal"]//span[@aria-hidden="true"]')
                except:
                    print("no se encontro titulo educacion ")
                string_education+= education_institution.text+'/'
                string_education+= education_degree.text

                if(i<(len(educations)-1)):
                    string_education+=";"

        else:

            for i,education in enumerate(educations):

                print(i,education)
                education_institution = education.find_element(By.XPATH,'.//h3[@class="pv-entity__school-name t-16 t-black t-bold"]') 

                string_education+= education_institution.text+"|"

                education_degrees = education.find_elements(By.XPATH,'.//p[contains(@class,"pv-entity__secondary-title")]//span[@class="pv-entity__comma-item"]')

                for j,education_degree in enumerate(education_degrees):

                    string_education += education_degree.text

                    if(j<(len(education_degrees)-1)):
                        string_education+=','


                if(i<(len(educations)-1)):
                    string_education+=";"

    # else:
    #     educations = driver.find_elements(By.XPATH,'//section[@class="artdeco-card ember-view pb3"]//div[@class="display-flex flex-column full-width align-self-center"]')


    #     for i,education in enumerate(educations):

    #         education_institution = education.find_element(By.XPATH, './/div[@class="display-flex align-items-center"]//span[@aria-hidden="true"]')

    #         education_degree = education.find_element(By.XPATH, './/span[@class="t-14 t-normal"]//span[@aria-hidden="true"]')

    #         string_education+= education_institution.text+'|'
    #         string_education+= education_degree.text

    #         if(i<(len(educations)-1)):
    #             string_education+=';'

    print("educacion:"+string_education)
    return string_education  
    
    

def getEducaciontUserCase2(driver):
    """Captura informacion de la formación profesional del usuario caso 2"""
    pageLoad(driver)
    sleep(5)
    print("obtener informacion formacion profesional caso 2")
    string_education = ""
    url_user = driver.current_url
    driver.get(driver.current_url+'/details/education')
    
    try:
        close_modal = WebDriverWait(driver,10).until(
            EC.element_to_be_clickable((By.XPATH,'//div[@role="dialog"]//button'))
        ).click()
    except:
        print("modal no encontrado")

    educations = driver.find_elements(By.XPATH,'//div[@class="display-flex flex-row justify-space-between"]')


    for i,education in enumerate(educations):
        education_institution = education.find_element(By.XPATH,'.//div[@class="display-flex align-items-center"]/span[contains(@class,"t-bold mr1")]/span[@aria-hidden="true"]')

        education_degree = education.find_element(By.XPATH,'//div[@class="display-flex flex-row justify-space-between"]//span[@class="t-14 t-normal"]//span[@aria-hidden="true"]')


        string_education += education_institution.text + '|'
        string_education += education_degree.text


        if(i<(len(educations)-1)):
            string_education += ';'

    print("formacion profesional capturada")
    driver.get(url_user)
    

    return string_education
    



def getExperienceUser(driver):
    """Captura información de la experiencia del usuario"""
    pageLoad(driver)
    sleep(5)
    print("obteniendo experiencia caso 1")
    string_experience = ''
    url_user = (driver.current_url).replace('details/experience/','')
    if 'details/experience/' in driver.current_url:
        print("ventanana details/experience")
        try:
            experiences = driver.find_elements(By.XPATH,'//section[@class="artdeco-card ember-view pb3"]//li[@class="pvs-list__paged-list-item artdeco-list__item pvs-list__item--line-separated "]')

            try:
                element_li = driver.find_element(By.XPATH,'//span[@class="pvs-entity__path-node"]')

                for index,experience in enumerate(experiences):
                

                    # ARREGLAR EXPERIENCE_LOCATIONS Y EXPERIENCE_DESCRIPTIONS
                    experience_locations = experience.find_elements(By.XPATH,'.//span[contains(@class,"t-bold")]//span[@aria-hidden="true"]')

                    experience_descriptions = experience.find_elements(By.XPATH,'.//section[@class="artdeco-card ember-view pb3"]//li[@class="pvs-list__paged-list-item artdeco-list__item pvs-list__item--line-separated "]//span[@class="t-14 t-normal"]//span[@aria-hidden="true"]|.//div[contains(@class,"pvs-entity")]//div[@class="pvs-list__outer-container"]//span[contains(@class,"t-bold mr1")]//span[@aria-hidden="true"]')

                    for j,experiece_location in experience_locations:
                        
                        string_experience += experiece_location.text+"|"

                        for k,experience_description in experience_descriptions:
                            string_experience += experience_description.text

                            if(k<(len(experience_descriptions))):
                                string_experience+=','

                        if(j<(len(experience_descriptions))):
                                string_experience+='/'

                    if(index<len(experiences)-1):
                        string_experience+=';'
            except:
                
                for index,experience in enumerate(experiences):
                    
                    experience_descriptions = experiences.find_elements(By.XPATH,'.//div[@class="display-flex flex-column full-width"]//div[@class="display-flex align-items-center"]//span[@aria-hidden="true"]')

                    experiece_locations = experiences.find_elements(By.XPATH, './/div[@class="display-flex flex-column full-width"]//span[@class="t-14 t-normal"]//span[@aria-hidden="true"]')

                    for i,experiece_location in enumerate(experiece_location):

                        string_experience += experiece_location.text + '|'
                        string_experience += experience_description

                        if(i<(len(experience_locations)-1)):
                            string_experience += ';'

                    if(index<(len(experiences)-1)):
                        string_experience += '/'


            try:
                print("buscando boton volver perfil usuario...")
                btn_back = WebDriverWait(driver,10).until(
                EC.element_to_be_clickable((By.XPATH,'//section[@class="artdeco-card ember-view pb3"]//div[@class="display-flex justify-flex-start align-items-center pt3 ph3"]//button[@class="artdeco-button artdeco-button--circle artdeco-button--muted artdeco-button--3 artdeco-button--tertiary ember-view"]'))
                ).click()
            except TimeoutException:
                print("boton no encontrado")

            print("experiencia:{}".format(string_experience))
            return string_experience
        except:
            print("No se encontró experiencia")
            driver.get(url_user)
            return ""
    else:
        try:
            #lista experiencias
            print("perfil usuario experiences 1")
            
            experiences = driver.find_elements(By.XPATH,'//section[@id="experience-section"]//section[@class="pv-profile-section__card-item-v2 pv-profile-section pv-position-entity ember-view"]')


            if (len(experiences)==0):
                
                experiences = driver.find_elements(By.XPATH,'//section//div[@id="experience"]/ancestor::section//ul[contains(@class,"pvs-list")]//li[@class="artdeco-list__item pvs-list__item--line-separated pvs-list__item--one-column"]')


                for index,experience in enumerate(experiences):
                    pass
                    
                    # '//section//div[@id="experience"]/ancestor::section//ul[contains(@class,"pvs-list")]//li[@class="artdeco-list__item pvs-list__item--line-separated pvs-list__item--one-column"]//div[contains(@class,"pvs-entity")]//div[@class="display-flex flex-row justify-space-between"]//a[@data-field]//div[@class="display-flex align-items-center"]//span[contains(@class,"t-bold mr1")]//span[@aria-hidden="true"]'

                    # '//div[@class="display-flex flex-row justify-space-between"]//div[@class="display-flex flex-column full-width"]//span[contains(@class,"t-bold")]'

                    # selector sin ruta relativa
                    # '//section//div[@id="experience"]/ancestor::section//ul[contains(@class,"pvs-list")]//li[@class="artdeco-list__item pvs-list__item--line-separated pvs-list__item--one-column"]//div[contains(@class,"pvs-entity")]//div[@class="display-flex flex-row justify-space-between"]//a[@data-field]//div[@class="display-flex align-items-center"]//span[contains(@class,"t-bold mr1")]//span[@aria-hidden="true"] | //section//div[@id="experience"]/ancestor::section//ul[contains(@class,"pvs-list")]//li[@class="artdeco-list__item pvs-list__item--line-separated pvs-list__item--one-column"]//div[@class="display-flex flex-row justify-space-between"]//div[@class="display-flex flex-column full-width"]//span[contains(@class,"t-bold")]'


                    # lugar donde trabajo
                    experience_locations = experience.find_elements(By.XPATH,'.//div[contains(@class,"pvs-entity")]//div[@class="display-flex flex-row justify-space-between"]//a[@data-field]//div[@class="display-flex align-items-center"]//span[contains(@class,"t-bold mr1")]//span[@aria-hidden="true"] | .//div[@class="display-flex flex-row justify-space-between"]//div[@class="display-flex flex-column full-width"]//span[contains(@class,"t-bold")]')


                    # '//section//div[@id="experience"]/ancestor::section//ul[contains(@class,"pvs-list")]//li[@class="artdeco-list__item pvs-list__item--line-separated pvs-list__item--one-column"]//div[contains(@class,"pvs-entity")]//div[@class="display-flex flex-row justify-space-between"]//div[@class="display-flex align-items-center"]/ancestor::a[not (contains(@data-field,"experience_company_logo"))]//div[@class="display-flex align-items-center"]//span[@aria-hidden="true"]'

                    # '//section//div[@id="experience"]/ancestor::section//ul[contains(@class,"pvs-list")]//li[@class="artdeco-list__item pvs-list__item--line-separated pvs-list__item--one-column"]//div[contains(@class,"pvs-entity")]//div[@class="display-flex align-items-center"]/ancestor::div[@class="display-flex flex-column full-width"]//span[contains(@class,"t-bold mr1")]//span[@aria-hidden="true"]'


                    #selector sin ruta relativa
                    # '//section//div[@id="experience"]/ancestor::section//ul[contains(@class,"pvs-list")]//li[@class="artdeco-list__item pvs-list__item--line-separated pvs-list__item--one-column"]//div[contains(@class,"pvs-entity")]//div[@class="display-flex flex-row justify-space-between"]//div[@class="display-flex align-items-center"]/ancestor::a[not (contains(@data-field,"experience_company_logo"))]//div[@class="display-flex align-items-center"]//span[@aria-hidden="true"] | //section//div[@id="experience"]/ancestor::section//ul[contains(@class,"pvs-list")]//li[@class="artdeco-list__item pvs-list__item--line-separated pvs-list__item--one-column"]//div[contains(@class,"pvs-entity")]//div[@class="display-flex align-items-center"]/ancestor::div[@class="display-flex flex-column full-width"]//span[contains(@class,"t-bold mr1")]//span[@aria-hidden="true"]'



                    # '//section//div[@id="experience"]/ancestor::section//ul[contains(@class,"pvs-list")]//li[@class="artdeco-list__item pvs-list__item--line-separated pvs-list__item--one-column"]'
                    #  tipo de trabajo
                    experience_descriptions = experience.find_elements(By.XPATH, './/div[contains(@class,"pvs-entity")]//div[@class="display-flex flex-row justify-space-between"]//div[@class="display-flex align-items-center"]/ancestor::a[not (contains(@data-field,"experience_company_logo"))]//div[@class="display-flex align-items-center"]//span[@aria-hidden="true"] | .//div[contains(@class,"pvs-entity")]//div[@class="display-flex align-items-center"]/ancestor::div[@class="display-flex flex-column full-width"]//span[contains(@class,"t-bold mr1")]//span[@aria-hidden="true"]')



                    for i,experiece_location in experience_locations:
                        string_experience += experiece_location.text + '|'
                        
                        for j,experience_description in experience_descriptions:
                            string_experience += experience_description.text

                            if(j<(len(experience_descriptions)-1)):
                                string_experience += ','

                        if (i<(len(experience_locations)-1)):
                            string_experience += ';'
                    
                    if(index(len(experiences)-1)):
                        string_experience += '/'

            else:
                try:
                    # si encuentra el elemento div con la clase company details
                    # quiere decir que tiene un listado de experiencia dentro de un mismmo lugar de trabajo
                    company_details = driver.find_element(By.XPATH,'//section[@class="pv-profile-section__card-item-v2 pv-profile-section pv-position-entity ember-view"]//a[contains(@class,"ember-view")]//div[@class="pv-entity__company-details"]')

                    # si no sale por la excepcion quiere decir que hay una lista de exp del mismo trabajo
                    
                    print("tiene lista de experiencias")

                    for index,experience in enumerate(experiences):
                        

                        # path sin ruta relativa
                        # '//section[@id="experience-section"]//section[@class="pv-profile-section__card-item-v2 pv-profile-section pv-position-entity ember-view"]//a[contains(@class,"ember-view")]//div[@class="pv-entity__company-details"]//div[@class="pv-entity__company-summary-info"]//h3/span[2] | //section[@id="experience-section"]//section[@class="pv-profile-section__card-item-v2 pv-profile-section pv-position-entity ember-view"]//a//p[@class="pv-entity__secondary-title t-14 t-black t-normal"]'


                        # lugar donde trabajo
                        experience_locations = experience.find_elements(By.XPATH,'.//a[contains(@class,"ember-view")]//div[@class="pv-entity__company-details"]//div[@class="pv-entity__company-summary-info"]//h3/span[2] | .//a//p[@class="pv-entity__secondary-title t-14 t-black t-normal"]')



                        #  tipo de trabajo
                        experience_descriptions = experience.find_elements(By.XPATH, './/div[contains(@class,"pv-entity__role-details-container")]//h3[@class="t-14 t-black t-bold"]//span[2] | .//a//div[contains(@class,"pv-entity__summary-info pv-entity__summary-info--background-section")]//h3[@class="t-16 t-black t-bold"]')
                        

                        for i,experience_location in enumerate(experience_locations):

                            string_experience += experience_location.text + '|'
                            
                            for j, experience_description in enumerate(experience_descriptions):
                                string_experience += experience_description.text

                                if(j<(len(experience_descriptions)-1)):
                                    string_experience += ","
                            
                            if(i<(len(experience_locations)-1)):
                                string_experience +="/"

                        if(index<(len(experiences)-1)):
                            string_experience +=";"
                except:
                    try:
                        print("perfil usuario experiences 2")
                        for index,experience in enumerate(experiences):

                            experience_location = experience.find_element(By.XPATH,'.//p[@class="pv-entity__secondary-title t-14 t-black t-normal"]')

                            experience_description = experience.find_element(By.XPATH, './/h3[@class="t-16 t-black t-bold"]')


                            string_experience += experience_location.text+'|'
                            string_experience += experience_description.text
                            
                            if(index<len(experiences)-1):
                                string_experience+=';'
                    except:
                        print("error 1")
                print("experiencia:"+string_experience)
                return string_experience
        except:
            print("no se encontró experiencia")
            return ""
    



def getExperienceUserCase2(driver):
    """Captura información de la experiencia del usuario"""
    string_experience = ''
    copiaUrl=driver.current_url
    driver.get(driver.current_url+'details/experience')
    sleep(10)
    try:
        elements_li = driver.find_elements(By.XPATH,'//*[contains(@class,"pvs-list__paged-list-item artdeco-lis")]')
        for index,element_li in enumerate(elements_li):
            string_experience+='▶'
            # ARREGLAR EXPERIENCE_LOCATIONS Y EXPERIENCE_DESCRIPTIONS
            experiences_cargo = element_li.find_elements(By.XPATH,'.//span[contains(@class,"t-bold")]//span[@aria-hidden="true"]')
            if(len(experiences_cargo)>1):
                for j,experience_cargo in enumerate(experiences_cargo):
                    string_experience += ' ● '
                    string_experience += experiences_cargo[j+1].text.title()
                    if(j==(len(experiences_cargo))-2):
                        string_experience += '【'
                        string_experience+=(experiences_cargo[0].text).upper()
                        string_experience += '】◀'
                        break
                break
            Aux=experiences_cargo[0].text.title()
            Aux=Aux.title()
            string_experience += Aux + '【'
            experience_Empresa = element_li.find_element(By.XPATH,'.//span[@class="t-14 t-normal"]//span[1]')
            experience_Empresa = experience_Empresa.text
            #experience_Empresa = experience_Empresa.title()
            string_experience += experience_Empresa.upper()+'】◀  '
            print("OMEEGAAAAAAAAAAA LUL")
            # string_experience+='————'
        print("OMEGA LULLLLLLLLLLLLLLL",len(elements_li))
        print("experiencia:{}".format(string_experience))
        driver.get(copiaUrl)
        return string_experience
    except Exception as e:
        print("Error encontrado :"+e)
        return ""











def pageLoad(driver):
    while True:
        print("cargando sitio...")
        if driver.execute_script("return document.readyState")=='complete':
            print("pagina cargada")
            break
        sleep(1)
    






def getExtractions(mycursor, mydb):
    """se obtiene array con las extracciones"""
    query = "SELECT * FROM extractions"
    mycursor.execute(query)
    myresult = mycursor.fetchall()
    return myresult

def getAccounts(mycursor, mydb):
    """se obtiene array con las cuentas"""
    query = "SELECT * FROM accounts"
    mycursor.execute(query)
    myresult = mycursor.fetchall()
    return myresult



class CaptchaException(Exception):
    """[Excepción que es lanzada cuando se detecta un enlace con captcha]

    """
    def __init__(self, url, mensaje=None):
        if(mensaje is None):
            menssaje = "Captcha Exception: {}".format(url)
        super(CaptchaException, self).__init__(mensaje)