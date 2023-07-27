<?php

namespace App\Controller;

use App\Entity\CalendarEvent;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class CalendarController extends AbstractController
{
    private EntityManagerInterface $em;

    private EntityRepository $calendarEventRepository;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->em = $entityManager;
        $this->calendarEventRepository = $this->em->getRepository(CalendarEvent::class);
    }

    #[Route('/calendar', methods: ['GET'])]
    public function index(): Response
    {
        return $this->render('calendar/index.html.twig');
    }

    #[Route('api/v1/calendars', name: 'api_calendar_store', methods: ['POST'])]
    public function store(Request $request, LoggerInterface $logger): Response
    {
        $mappings = [
            'fromTime' => 'from_time',
            'toTime' => 'to_time',
            'isAllDay' => 'is_all_day'
        ];
        $data = [];
        $success = true;
        $message = 'Event created successfully';
        try {
            foreach ($request->request->all() as $k => $v) {
                $attr = $k;
                if (array_key_exists($k, $mappings)) {
                    $attr = $mappings[$k];
                }
                if (in_array($attr, ['from_time', 'to_time'])) {
                    $data[$attr] = new \DateTime($v);
                } else {
                    $data[$attr] = $v;
                }
            }
            $created = $this->calendarEventRepository->store($data);
        } catch (\Throwable $th) {
            $success = false;
            $message = $th->getMessage();
            $logger->error('Failed to create new event, an error occurred: ' . $message);
        }
  
        return $this->json([
            'success' => $success,
            'message' => $message,
            'entity' => $created ?? null
        ], Response::HTTP_CREATED);
    }

    #[Route('api/v1/calendars', name: 'api_calendar_fetch_all_events', methods: ['GET'])]
    public function fetchAllEvents(Request $request): Response
    {
        $allEvents = $this->calendarEventRepository->getAllEvents();
  
        return $this->json([
            'events' => $allEvents
        ]);
    }
}

?>