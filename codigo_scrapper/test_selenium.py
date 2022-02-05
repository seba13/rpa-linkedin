from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from time import sleep
from msedge.selenium_tools import Edge, EdgeOptions

def main():
    capabilities = webdriver.DesiredCapabilities.CHROME.copy()
    
    options = EdgeOptions()
    options.add_argument('--start-maximized')
    driver = Edge(executable_path=r'C:\practicando\angular\rpa-linkedin\codigo_scrapper\msedgedriver.exe',options=options)
    
    driver.get("https://www.google.com")
    
    search_input_box = driver.find_element(By.NAME, "q")
    
    search_input_box.send_keys("selenium webdriver" + Keys.ENTER)
    
    sleep(3)
    
    driver.quit()
    print("prueba ok!")


if __name__ == '__main__':
    main()
