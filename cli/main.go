/*
Copyright © 2025 Stefan Mladic (mladicstefan)

Repository: github.com/mladicstefan/fetchman
License: MIT
*/
package main

import (
	"fmt"
	"os"
	"path/filepath"

	htmltomarkdown "github.com/JohannesKaufmann/html-to-markdown/v2"
)

func exitOnErr(msg string, err error) {
	if err != nil {
		fmt.Fprintln(os.Stderr, msg, err)
		os.Exit(1)
	}
}

func main() {
	cacheDir, err := os.UserCacheDir()
	appCacheDir := filepath.Join(cacheDir, "fetchman")
	err = os.MkdirAll(appCacheDir, 0755) // rwxr-xr-x
	exitOnErr("Error making cache dir", err)

	args := os.Args[1:]
	HandleMissingMan()
	if len(args) < 1 {
		fmt.Println("Usage: fetchman <topic>")
	}

	topic := args[0]

	html, err := FetchManHTML(topic)
	exitOnErr("Failed to generate html:", err)

	htmlFile := fmt.Sprintf("%s.html", topic)
	htmlPath := filepath.Join(appCacheDir, htmlFile)

	err = os.WriteFile(htmlPath, html, 0644) // rw-r--r--
	exitOnErr("Failed to write html", err)

	markdown, err := htmltomarkdown.ConvertString(string(html))
	exitOnErr("Failed to generate markdown", err)

	mdFile := fmt.Sprintf("%s.md", topic)
	markdownPath := filepath.Join(appCacheDir, mdFile)

	err = os.WriteFile(markdownPath, []byte(markdown), 0644) //rw-r--r--
	exitOnErr("Failed to write markdown", err)
}
