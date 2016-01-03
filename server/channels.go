package server

import (
	"net/http"

	"database/sql"
	"github.com/danjac/podbaby/decoders"
	"github.com/danjac/podbaby/models"
)

func (s *Server) getChannelDetail(w http.ResponseWriter, r *http.Request) {
	user, _ := getUser(r)
	channelID, err := getInt64(r, "id")
	if err != nil {
		s.abort(w, r, err)
		return
	}
	channel, err := s.DB.Channels.GetByID(channelID, user.ID)
	if err != nil {
		s.abort(w, r, err)
		return
	}
	detail := &models.ChannelDetail{
		Channel: channel,
	}
	podcasts, err := s.DB.Podcasts.SelectByChannelID(channelID, user.ID, getPage(r))
	if err != nil {
		s.abort(w, r, err)
		return
	}
	for _, pc := range podcasts.Podcasts {
		pc.Name = channel.Title
		pc.Image = channel.Image
		pc.ChannelID = channel.ID
		detail.Podcasts = append(detail.Podcasts, pc)
	}
	detail.Page = podcasts.Page
	s.Render.JSON(w, http.StatusOK, detail)
}

func (s *Server) getChannels(w http.ResponseWriter, r *http.Request) {
	user, _ := getUser(r)
	channels, err := s.DB.Channels.SelectSubscribed(user.ID)
	if err != nil {
		s.abort(w, r, err)
		return
	}
	s.Render.JSON(w, http.StatusOK, channels)
}

func (s *Server) addChannel(w http.ResponseWriter, r *http.Request) {

	decoder := &decoders.NewChannel{}

	if err := decoders.Decode(r, decoder); err != nil {
		s.abort(w, r, HTTPError{http.StatusBadRequest, err})
		return
	}

	user, _ := getUser(r)

	channel, err := s.DB.Channels.GetByURL(decoder.URL, user.ID)

	isNewChannel := false

	if err != nil {
		if err == sql.ErrNoRows {
			isNewChannel = true
		} else {
			s.abort(w, r, err)
			return
		}
	}

	if isNewChannel {
		channel = &models.Channel{
			URL: decoder.URL,
		}
		if err := s.Feedparser.FetchChannel(channel); err != nil {
			s.abort(w, r, err)
			return
		}
	}

	if !channel.IsSubscribed {
		if err := s.DB.Subscriptions.Create(channel.ID, user.ID); err != nil {
			s.abort(w, r, err)
			return
		}
		channel.IsSubscribed = true
	}

	var status int
	if isNewChannel {
		status = http.StatusCreated
	} else {
		status = http.StatusOK
	}

	s.Render.JSON(w, status, channel)
}
