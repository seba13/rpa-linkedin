#!/usr/bin/env python
#_*_ coding: utf8 -*-
from distutils.log import error
import random
from sys import flags
import traceback
from time import sleep

from selenium import webdriver
# from selenium.webdriver.chrome.options import Options


from selenium.webdriver.edge.options import Options
from selenium.webdriver.edge.service import Service

# from msedge.selenium_tools import Edge, EdgeOptions

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import TimeoutException
import string
from datetime import datetime
from dateutil.relativedelta import relativedelta
from utils import CaptchaException, commitQuery, rollbackQuery, runExtraction 
# from utils import scroll40Posts as scrollCargar40Posts, 
from utils import getUserInfo, connectMySql, wait, updateExtraction, deleteInfoCompany, getExtractions, getAccounts


# from selenium.webdriver.chrome.service import Service
# from selenium.webdriver.chrome.options import Options
    
def main():
    
    mycursor, mydb = connectMySql()

    #se solicitan las cuentas
    accounts = getAccounts(mycursor, mydb)

    #Se solicitan extracciones
    extractions = getExtractions(mycursor, mydb)


    print("Extracciones encontradas: ", extractions)

    # print("Total encontradas: ", len(extractions))


    #Se recorren extracciones
    i_extraction = 1 #índice extraction
    flag = True

    for extraction in extractions:
        # print(extractions)
        flag = True
        random.shuffle(accounts)
        while flag:
            for account in accounts:
                #se toma una cuenta para hacer la extracción
                user = account[1]
                password = account[2]
                try:
                    #Config driver original
                    # opts = Options()
                    # opts.add_argument("user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/71.0.3578.80 Chrome/71.0.3578.80 Safari/537.36")
                    
                    # driver = webdriver.Chrome('./chromedriver', chrome_options=opts)
                    
                    #para docker anterior
                    # opts.headless = True
                    # opts.add_argument("start-maximized");
                    # opts.add_argument("enable-automation");
                    # opts.add_argument("--no-sandbox"); 
                    # opts.add_argument("--disable-infobars");
                    # opts.add_argument("--disable-browser-side-navigation");
                    # opts.add_argument("--disable-gpu");

                    # capabilities = webdriver.DesiredCapabilities.CHROME.copy()
        
                    service = Service(executable_path=r"../msedgedriver.exe")
                    options = Options()
                    options.add_experimental_option('excludeSwitches', ['enable-logging'])
                    driver = webdriver.Edge(service=service, options=options)

                    name_company = extraction[1]
                    admin = extraction[3]
                    number_company = extraction[5]
                    
                    print("Comenzando extracción de ",name_company,"...")

                    #se asigna la url donde están las publicaciones de la compañía
                    if(admin == True):
                        url_posts = 'https://www.linkedin.com/company/'+ name_company +'/posts/?feedView=all&viewAsMember=true'
                    else:
                        url_posts = 'https://www.linkedin.com/company/'+ name_company +'/posts/?feedView=all'            
                    
                    driver.get('https://www.linkedin.com/')
                    
                    # print(driver.page_source)

                    #se inicia sesión
                    print("Iniciando sesión")
                    print("correo electronico:{}".format(account))
                    sleep(3)
                    print("Buscando session_key")
                    input_user = WebDriverWait(driver, 30).until(
                        EC.presence_of_element_located((By.XPATH, '//main//input[@id="session_key"]'))
                    )

                    input_user.send_keys(user)

                    print("Buscando session_password")
                    input_password = driver.find_element(By.XPATH , '//main//input[@id="session_password"]')
                    input_password.send_keys(password)

                    print("Buscando form button")
                    boton_login = driver.find_element(By.XPATH, '//div[@class="sign-in-form-container"]/form/button')
                    
                    boton_login.click()
                

                    sleep(5)

                    print("url actual: "+driver.current_url)
                    if('https://www.linkedin.com/checkpoint/' in driver.current_url or 'https://www.linkedin.com/authwall?' in driver.current_url):
                        
                        raise CaptchaException(driver.current_url,"Captcha Encontrado")
                    else:
                        print("Logeado con éxito, iniciando extracción")
                        #se comienza la extracción
                        # runExtraction(driver,name_company, number_company, admin, url_posts, mycursor, mydb )
                        runExtraction(driver, number_company, admin, url_posts, mycursor, mydb )
                        print("Extracción terminada con éxito.")

                        commitQuery(mydb)

                        # Actualiza la fecha de la ultima extraccion
                        updateExtraction(mycursor, mydb, name_company)

                        driver.quit()
                        
                        # random.shuffle(accounts) #se desordena lista de cuentas
                        print("llega aca 1")
                        # sale del ciclo for
                        # print("sale del ciclo while")
                        flag = False
                        break
                except TimeoutException:
                    print("ha ocurrido un problema, cambiando de cuenta.")
                    print("sleep 500...")
                    sleep(10)
                    continue
                except KeyboardInterrupt:
                    print("\nProceso Interrumpido. \nCerrando app")
                    rollbackQuery(mydb)
                    driver.quit()
                    exit()
                except CaptchaException as e:
                    print(e)
                    print("cambiando de cuenta.")
                    print("sleep 500...")
                    sleep(10)
                    driver.quit()
                    continue
                except Exception as e:
                    print("error: ")
                    print(e)
                    print("traza: ")
                    traceback.print_exc()
                    # deleteInfoCompany(mycursor,mydb,name_company,admin)
                    rollbackQuery(mydb)
                    print("Ha ocurrido un error, cambiando de cuenta.")
                    print("sleep 500...")
                    sleep(10)
                    continue
                
        if(i_extraction<len(extractions)):
            if(len(extractions) - i_extraction ==0):
                print("Extracciones Completadas!")
                exit()
            try:
                wait(random.randrange(1800, 2100)) #se espera 12 horas app (varía en minutos) para comenzar la siguiente extracción
            except KeyboardInterrupt:
                print("\nProceso Interrumpido. \nCerrando app...")
                exit()
if __name__ == '__main__':
    print("Iniciando...")
    main()
