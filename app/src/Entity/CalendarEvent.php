<?php

namespace App\Entity;

use App\Repository\CalendarEventRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CalendarEventRepository::class)]
class CalendarEvent
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    private ?string $email = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $phone = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $from_time = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $to_time = null;

    #[ORM\Column(nullable: true)]
    private ?bool $is_all_day = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $color = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): static
    {
        $this->phone = $phone;

        return $this;
    }

    public function getFromTime(): ?\DateTimeInterface
    {
        return $this->from_time;
    }

    public function setFromTime(\DateTimeInterface $from_time): static
    {
        $this->from_time = $from_time;

        return $this;
    }

    public function getToTime(): ?\DateTimeInterface
    {
        return $this->to_time;
    }

    public function setToTime(\DateTimeInterface $to_time): static
    {
        $this->to_time = $to_time;

        return $this;
    }

    public function isIsAllDay(): ?bool
    {
        return $this->is_all_day;
    }

    public function setIsAllDay(?bool $is_all_day): static
    {
        $this->is_all_day = $is_all_day;

        return $this;
    }

    public function setData($dto)
    {
        foreach ($dto as $attr => $val) {
            $this->$attr = $val;
        }
    }

    public function getColor(): ?string
    {
        return $this->color;
    }

    public function setColor(?string $color): static
    {
        $this->color = $color;

        return $this;
    }
}
