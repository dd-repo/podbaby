package models

import (
	"database/sql"
)

// Channel is a single RSS/Atom podcast feed
type Channel struct {
	ID          int            `db:"id" json:"id"`
	Title       string         `db:"title" json:"title"`
	Description string         `db:"description" json:"description"`
	Keywords    sql.NullString `db:"keywords" json:"-"`
	Image       string         `db:"image" json:"image"`
	URL         string         `db:"url" json:"url"`
	Website     sql.NullString `db:"website" json:"website"`
	NumPodcasts int            `db:"num_podcasts" json:"numPodcasts"`
	Podcasts    []*Podcast     `db:"-" json:"-"`
	Categories  []string       `db:"-" json:"-"`
}

// ChannelDetail includes channel, podcast, and related channel info
type ChannelDetail struct {
	Channel    *Channel   `json:"channel"`
	Categories []Category `json:"categories"`
	Podcasts   []Podcast  `json:"podcasts"`
	Related    []Channel  `json:"relatedChannels"`
	Page       *Paginator `json:"page"`
}
