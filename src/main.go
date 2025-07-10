/*
Copyright © 2025 Stefan Mladic (mladicstefan)

Repository: github.com/mladicstefan/fetchman
License: MIT
*/
package main

import (
	"fmt"
	"os"

	htmltomarkdown "github.com/JohannesKaufmann/html-to-markdown/v2"
)

func main() {

	args := os.Args[1:]

	//gracefully handle man not installed
	HandleMissingMan()

	if len(args) < 1 {
		fmt.Println("Usage: fetchman <topic>")
		os.Exit(1)
	}

	topic := args[0]

	html, err := FetchManHTML(topic)
	if err != nil {
		fmt.Println(os.Stderr, "HTML Conversion failed...")
		os.Exit(1)
	}

	markdown, err := htmltomarkdown.ConvertString(string(html))
	if err != nil {
		fmt.Println(os.Stderr, "Markdown conevrsion failed...")
		os.Exit(1)
	}

	fmt.Println(markdown)
}
