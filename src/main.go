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

func main() {
	cacheDir, err := os.UserCacheDir()
	appCacheDir := filepath.Join(cacheDir, "fetchman")
	err = os.MkdirAll(appCacheDir, 0755) // rwxr-xr-x

	args := os.Args[1:]
	HandleMissingMan()
	if len(args) < 1 {
		fmt.Println("Usage: fetchman <topic>")
		os.Exit(1)
	}

	topic := args[0]

	html, err := FetchManHTML(topic)
	if err != nil {
		fmt.Fprintln(os.Stderr, "Error converting html...", err)
		os.Exit(1)
	}

	htmlPath := filepath.Join(appCacheDir, "output.html")
	err = os.WriteFile(htmlPath, html, 0644) // rw-r--r--
	if err != nil {
		fmt.Fprintln(os.Stderr, "Error saving html...", err)
		os.Exit(1)
	}

	markdown, err := htmltomarkdown.ConvertString(string(html))
	if err != nil {
		fmt.Fprintln(os.Stderr, "Error converting markdown...", err)
		os.Exit(1)
	}
	markdownPath := filepath.Join(appCacheDir, "output.md")
	err = os.WriteFile(markdownPath, []byte(markdown), 0644) //rw-r--r--
	if err != nil {
		fmt.Fprintln(os.Stderr, "Error saving markdown...", err)
		os.Exit(1)
	}
}
