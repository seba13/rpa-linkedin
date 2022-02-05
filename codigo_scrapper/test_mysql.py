import mysql.connector


def main():
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="demoLinkedinScrapper3"
    )

    mycursor = mydb.cursor()
    
    query = "SELECT * FROM companies;"

    mycursor.execute(query)
    
    myresult = mycursor.fetchall()
    
    print(myresult)
    
    mycursor.close()
    mydb.close()


if __name__ == '__main__':
    main()
