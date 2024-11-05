' start-meal-planner.vbs
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Projects\mon-planificateur"

' Démarrer le serveur Next.js en arrière-plan
WshShell.Run "cmd /c npm run dev", 0

' Attendre quelques secondes pour que le serveur démarre
WScript.Sleep 3000

' Ouvrir le navigateur
WshShell.Run "http://localhost:3000"