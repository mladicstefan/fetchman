/*
Copyright © 2025 Stefan Mladic (mladicstefan)

Repository: github.com/mladicstefan/fetchman
License: MIT
*/
package main

import (
	"fmt"
	"os"
	"os/exec"
)

func FetchManHTML(topic string) (output []byte, err error) {
	cmd := exec.Command("man", "-Thtml", topic)
	output, err = cmd.CombinedOutput()
	return output, err
}

func HandleMissingMan() {
	if _, err := exec.LookPath("man"); err != nil {
		fmt.Fprintln(os.Stderr, "Error: 'man' command not found in PATH")
		os.Exit(1)
	}
}
